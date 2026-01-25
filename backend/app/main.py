from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import cv2
import numpy as np
from datetime import datetime
from typing import Dict, List
import io
from PIL import Image

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.models.emotion_model import EmotionDetector
from app.models.risk_engine import RiskEngine
from app.utils.temporal_smoothing import TemporalSmoother
from app.config import config

# Initialize FastAPI app
app = FastAPI(
    title="Worker Fatigue Detection API",
    description="Real-time fatigue and stress detection for manufacturing workers",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models
emotion_detector = EmotionDetector()
risk_engine = RiskEngine()
temporal_smoother = TemporalSmoother()

# Store session data
session_data = {
    'predictions': [],
    'session_start': None,
    'frame_count': 0
}

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "message": "Worker Fatigue Detection API",
        "version": "1.0.0"
    }

@app.post("/api/analyze-frame")
async def analyze_frame(file: UploadFile = File(...)):
    """
    Analyze a single frame for emotion detection
    
    Returns:
        - Raw emotion prediction
        - Smoothed prediction
        - Risk assessment
    """
    try:
        # Read image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Detect emotion
        prediction = emotion_detector.predict_emotion(image)
        
        if prediction is None:
            return JSONResponse({
                "status": "no_face",
                "message": "No face detected in frame",
                "timestamp": datetime.now().isoformat()
            })
        
        # Add to temporal smoother
        temporal_smoother.add_prediction(prediction['probabilities'])
        smoothed_probs = temporal_smoother.get_smoothed_probabilities()
        
        # Calculate session duration
        if session_data['session_start'] is None:
            session_data['session_start'] = datetime.now()
        
        duration = (datetime.now() - session_data['session_start']).total_seconds() / 60
        
        # Calculate risk with smoothed probabilities
        risk_assessment = risk_engine.calculate_risk_score(
            smoothed_probs['Fatigue'],
            smoothed_probs['Stress'],
            int(duration)
        )
        
        # Get trend
        trend = temporal_smoother.get_trend()
        
        # Store prediction
        session_data['predictions'].append(prediction)
        session_data['frame_count'] += 1
        
        return {
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "raw_prediction": {
                "emotion": prediction['emotion'],
                "confidence": prediction['confidence'],
                "probabilities": prediction['probabilities']
            },
            "smoothed_prediction": {
                "probabilities": smoothed_probs,
                "emotion": max(smoothed_probs, key=smoothed_probs.get)
            },
            "risk_assessment": risk_assessment,
            "trend": trend,
            "session_info": {
                "duration_minutes": round(duration, 2),
                "frame_count": session_data['frame_count'],
                "buffer_size": temporal_smoother.get_buffer_size()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/summary")
async def get_analytics_summary():
    """Get session analytics summary"""
    
    if not session_data['predictions']:
        return {
            "status": "no_data",
            "message": "No predictions available yet"
        }
    
    # Calculate statistics
    stats = risk_engine.calculate_batch_statistics(session_data['predictions'])
    
    # Session info
    duration = 0
    if session_data['session_start']:
        duration = (datetime.now() - session_data['session_start']).total_seconds() / 60
    
    return {
        "status": "success",
        "session_info": {
            "start_time": session_data['session_start'].isoformat() if session_data['session_start'] else None,
            "duration_minutes": round(duration, 2),
            "total_frames": session_data['frame_count']
        },
        "statistics": stats,
        "current_smoothed": temporal_smoother.get_smoothed_probabilities()
    }

@app.get("/api/analytics/history")
async def get_prediction_history(limit: int = 100):
    """Get recent prediction history"""
    
    recent_predictions = session_data['predictions'][-limit:]
    
    # Format for frontend charts
    history = []
    for i, pred in enumerate(recent_predictions):
        history.append({
            "index": i,
            "timestamp": datetime.now().isoformat(),  # In real app, store actual timestamps
            "fatigue": pred['probabilities']['Fatigue'] * 100,
            "stress": pred['probabilities']['Stress'] * 100,
            "normal": pred['probabilities']['Normal'] * 100,
            "emotion": pred['emotion']
        })
    
    return {
        "status": "success",
        "count": len(history),
        "history": history
    }

@app.post("/api/session/reset")
async def reset_session():
    """Reset current session"""
    session_data['predictions'].clear()
    session_data['session_start'] = None
    session_data['frame_count'] = 0
    temporal_smoother.reset()
    
    return {
        "status": "success",
        "message": "Session reset successfully"
    }

@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model_loaded": emotion_detector.model is not None,
        "session_active": session_data['session_start'] is not None,
        "predictions_count": len(session_data['predictions'])
    }

if __name__ == "__main__":
    import uvicorn
    import sys
    
    print("=" * 60)
    print("  WORKER FATIGUE DETECTION API")
    print("=" * 60)
    print(f"  Model path: {config.MODEL_PATH}")
    print(f"  Server: http://localhost:8000")
    print(f"  Docs: http://localhost:8000/docs")
    print("=" * 60)
    
    try:
        uvicorn.run(
            "main:app" if __name__ == "__main__" else app,
            host="0.0.0.0", 
            port=8000,
            reload=False
        )
    except Exception as e:
        print(f"\n Error starting server: {e}")
        print("\nTroubleshooting:")
        print("1. Check if port 8000 is already in use")
        print("2. Ensure model file exists at:", config.MODEL_PATH)
        print("3. Try running from backend folder: python -m app.main")
        sys.exit(1)