"""
Download pre-trained model from cloud storage
Run this on server startup if model doesn't exist
"""

import os
import urllib.request
from pathlib import Path

MODEL_URL = "https://drive.google.com/file/d/1-elSlX4xjlGTU3KcMOWIRjUGajpYnwQf/view?usp=sharing"  # Upload to Dropbox/Google Drive and get direct link
MODEL_PATH = Path("saved_models/emotion_model_final.h5")

def download_model():
    """Download model if it doesn't exist"""
    
    if MODEL_PATH.exists():
        print(f"✅ Model already exists: {MODEL_PATH}")
        return True
    
    print(f"📥 Downloading model from {MODEL_URL}...")
    
    try:
        # Create directory
        MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
        
        # Download
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        
        print(f"✅ Model downloaded successfully: {MODEL_PATH}")
        return True
        
    except Exception as e:
        print(f"❌ Error downloading model: {e}")
        return False

if __name__ == "__main__":
    download_model()