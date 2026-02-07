import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from tensorflow.keras.models import load_model
from sklearn.metrics import confusion_matrix

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ml_training.prepare_dataset import load_data

model = load_model("../saved_models/emotion_model_final.h5")
X_test, y_test = load_data(split="test")

y_pred = np.argmax(model.predict(X_test), axis=1)
y_true = np.argmax(y_test, axis=1)

cm = confusion_matrix(y_true, y_pred)
cm_norm = cm.astype('float') / cm.sum(axis=1)[:, None]

sns.heatmap(
    cm_norm,
    annot=True,
    fmt=".2f",
    xticklabels=["Fatigue","Stress","Normal"],
    yticklabels=["Fatigue","Stress","Normal"],
    cmap="Blues"
)

plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("Normalized Confusion Matrix")
plt.show()

# plt.figure(figsize=(6,5))
# sns.heatmap(cm, annot=True, cmap="Blues",
#             xticklabels=["Fatigue","Stress","Normal"],
#             yticklabels=["Fatigue","Stress","Normal"])
# plt.xlabel("Predicted")
# plt.ylabel("Actual")
# plt.title("Confusion Matrix")
# plt.show()
