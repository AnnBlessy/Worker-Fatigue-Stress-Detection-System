import cv2
import numpy as np
import matplotlib.pyplot as plt
from tensorflow.keras.models import load_model

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.utils.temporal_smoothing import TemporalSmoother
# Load trained model
model = load_model("../saved_models/emotion_model_final.h5")

# Initialize smoother (same window as production)
smoother = TemporalSmoother(window_size=10)

cap = cv2.VideoCapture(0)  # or path to test video

raw_probs = []
smoothed_probs = []

frame_count = 0

while frame_count < 50:
    ret, frame = cap.read()
    if not ret:
        break

    # Preprocess frame (same as backend)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    face = cv2.resize(gray, (48, 48))
    face = face / 255.0
    face = face.reshape(1, 48, 48, 1)

    preds = model.predict(face, verbose=0)[0]

    stress_prob = preds[1]  # Stress class index

    raw_probs.append(stress_prob)
    smoothed_probs.append(smoother.update(stress_prob))

    frame_count += 1

cap.release()

plt.figure(figsize=(8,4))
plt.plot(raw_probs, label="Raw CNN Output", alpha=0.5)
plt.plot(smoothed_probs, label="Temporal Smoothed Output", linewidth=3)
plt.xlabel("Frame Index")
plt.ylabel("Stress Probability")
plt.title("Temporal Stability of Stress Prediction (Model-Based)")
plt.legend()
plt.grid(True)
plt.show()
