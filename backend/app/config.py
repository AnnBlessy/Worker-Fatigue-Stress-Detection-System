import os
from pathlib import Path

class Config:
    # Paths
    BASE_DIR = Path(__file__).parent.parent
    MODEL_PATH = BASE_DIR / "saved_models" / "emotion_model_final.h5"
    
    # Model settings
    IMG_SIZE = (48, 48)
    CLASS_NAMES = ["Fatigue", "Stress", "Normal"]
    
    # Risk calculation weights
    FATIGUE_WEIGHT = 0.5
    STRESS_WEIGHT = 0.3
    DURATION_WEIGHT = 0.2
    
    # Temporal smoothing
    SMOOTHING_WINDOW = 15  # Number of frames to average
    
    # Risk thresholds
    RISK_LEVELS = {
        "normal": (0, 40),
        "warning": (41, 70),
        "critical": (71, 100)
    }
    
    # API settings
    CORS_ORIGINS = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173"
    ]

config = Config()