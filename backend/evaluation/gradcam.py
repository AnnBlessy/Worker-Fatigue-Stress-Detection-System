import tensorflow as tf
import cv2
import numpy as np
import matplotlib.pyplot as plt
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ml_training.prepare_dataset import load_data

model = tf.keras.models.load_model("../saved_models/emotion_model_final.h5")

last_conv = model.get_layer("conv2d_2")  # adjust if needed
grad_model = tf.keras.models.Model(
    [model.inputs],
    [last_conv.output, model.output]
)

def gradcam(img):
    with tf.GradientTape() as tape:
        conv_out, preds = grad_model(img)
        loss = preds[:, tf.argmax(preds[0])]

    grads = tape.gradient(loss, conv_out)
    pooled_grads = tf.reduce_mean(grads, axis=(0,1,2))
    heatmap = tf.reduce_sum(conv_out * pooled_grads, axis=-1)
    heatmap = np.maximum(heatmap, 0) / np.max(heatmap)
    return heatmap[0]

# Load test data
X_test, y_test = load_data(split="test")

# Use a test image
heatmap = gradcam(X_test[0:1])

plt.imshow(heatmap, cmap="jet")
plt.title("Grad-CAM Heatmap")
plt.colorbar()
plt.show()
