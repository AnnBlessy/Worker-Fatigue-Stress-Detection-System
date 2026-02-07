import numpy as np
from tensorflow.keras.models import load_model
from sklearn.metrics import classification_report

# When running this script directly, the sibling package `ml_training` may
# not be on sys.path. Prepend the backend folder so imports work both when
# running as a script and when executed as a package module.
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from ml_training.prepare_dataset import load_data

model = load_model("../saved_models/emotion_model_final.h5")

X_test, y_test = load_data(split="test")

y_pred = model.predict(X_test)
y_pred_cls = np.argmax(y_pred, axis=1)
y_true = np.argmax(y_test, axis=1)

print(classification_report(
    y_true,
    y_pred_cls,
    target_names=["Fatigue", "Stress", "Normal"]
))

if __name__ == "__main__":
    import os
    os.system("python -m pip install -r backend/requirements.txt")
    os.system("python backend/evaluation/evaluation_model.py")
