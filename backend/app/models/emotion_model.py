import cv2
import numpy as np
import tensorflow as tf
import mediapipe as mp
from typing import Dict, Optional, Tuple
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.config import config

class EmotionDetector:
    def __init__(self):
        """Initialize the emotion detection model and face detector"""
        print("🔄 Loading emotion model...")
        self.model = tf.keras.models.load_model(str(config.MODEL_PATH))
        print("✅ Model loaded successfully")
        
        # Initialize MediaPipe Face Detection
        self.mp_face = mp.solutions.face_detection
        self.face_detection = self.mp_face.FaceDetection(
            model_selection=0,
            min_detection_confidence=0.5
        )
        
        self.class_names = config.CLASS_NAMES
    
    def detect_face(self, image: np.ndarray) -> Optional[Tuple[int, int, int, int]]:
        """
        Detect face in image using MediaPipe
        Returns: (x, y, w, h) or None
        """
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.face_detection.process(rgb_image)
        
        if not results.detections:
            return None
        
        # Get first face
        detection = results.detections[0]
        bbox = detection.location_data.relative_bounding_box
        
        h, w = image.shape[:2]
        x = int(bbox.xmin * w)
        y = int(bbox.ymin * h)
        width = int(bbox.width * w)
        height = int(bbox.height * h)
        
        # Ensure bbox is within image bounds
        x = max(0, x)
        y = max(0, y)
        width = min(width, w - x)
        height = min(height, h - y)
        
        return (x, y, width, height)
    
    def preprocess_face(self, face_img: np.ndarray) -> np.ndarray:
        """Preprocess face image for model input"""
        # Resize to 48x48
        face_resized = cv2.resize(face_img, config.IMG_SIZE)
        
        # Convert to grayscale
        if len(face_resized.shape) == 3:
            face_gray = cv2.cvtColor(face_resized, cv2.COLOR_BGR2GRAY)
        else:
            face_gray = face_resized
        
        # Normalize
        face_normalized = face_gray / 255.0
        
        # Add batch and channel dimensions
        face_processed = np.expand_dims(face_normalized, axis=-1)
        face_processed = np.expand_dims(face_processed, axis=0)
        
        return face_processed
    
    def predict_emotion(self, image: np.ndarray) -> Optional[Dict]:
        """
        Detect face and predict emotion
        Returns: {
            'emotion': str,
            'confidence': float,
            'probabilities': dict,
            'bbox': tuple
        }
        """
        # Detect face
        bbox = self.detect_face(image)
        if bbox is None:
            return None
        
        x, y, w, h = bbox
        
        # Extract face region
        face_roi = image[y:y+h, x:x+w]
        
        if face_roi.size == 0:
            return None
        
        # Preprocess
        face_processed = self.preprocess_face(face_roi)
        
        # Predict
        predictions = self.model.predict(face_processed, verbose=0)[0]
        
        # Get emotion
        emotion_idx = np.argmax(predictions)
        emotion = self.class_names[emotion_idx]
        confidence = float(predictions[emotion_idx])
        
        # Create probabilities dict
        probabilities = {
            name: float(prob) 
            for name, prob in zip(self.class_names, predictions)
        }
        
        return {
            'emotion': emotion,
            'confidence': confidence,
            'probabilities': probabilities,
            'bbox': bbox
        }
    
    def __del__(self):
        """Cleanup"""
        if hasattr(self, 'face_detection'):
            self.face_detection.close()