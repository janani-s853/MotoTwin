# routes/brake.py

from fastapi import APIRouter
import numpy as np
import tensorflow as tf

router = APIRouter()

# --------------------------
# Load Model
# --------------------------
try:
    brake_model = tf.keras.models.load_model("model/brake_model.h5")
    print("✅ Brake model loaded")
except Exception as e:
    print("❌ Model load error:", e)
    brake_model = None

# --------------------------
# Normalization
# --------------------------
mean = np.array([5, 5, 0, 0, 5, 1])
std = np.array([2, 2, 2, 2, 2, 0.5])

# --------------------------
# STORE LATEST RESULT
# --------------------------
latest_brake = {
    "brake": {
        "status": "Healthy",
        "message": "Brake performance is normal"
    },
    "balance": {
        "status": "Stable",
        "message": "Good stability"
    }
}

# --------------------------
# PROCESS FUNCTION
# --------------------------
def process_brake_data(data):
    global latest_brake

    if brake_model is None:
        return

    required_keys = [
        "deceleration", "vibration",
        "tilt_x", "tilt_y",
        "angular_velocity", "response_time"
    ]

    # Validate input
    for key in required_keys:
        if key not in data:
            return

    # -------------------------
    # BRAKE MODEL
    # -------------------------
    sample = np.array([[data[k] for k in required_keys]], dtype=np.float32)
    sample = (sample - mean) / std
    sample = sample.reshape(1, 6, 1)

    pred = brake_model.predict(sample, verbose=0)
    class_idx = int(np.argmax(pred))

    brake_labels = ["Healthy", "Likely Faulty", "Faulty"]
    brake_status = brake_labels[class_idx]

    brake_message = "Brake status computed"  # Generic message, no alert

    # -------------------------
    # BALANCE LOGIC
    # -------------------------
    tilt_x = data["tilt_x"]
    tilt_y = data["tilt_y"]
    angular_velocity = data["angular_velocity"]

    tilt_magnitude = np.sqrt(tilt_x**2 + tilt_y**2)

    balance_status = "Stable" if tilt_magnitude < 2.5 and angular_velocity < 5 else "Unstable"
    balance_message = "Balance status computed"  # Generic message, no alert

    # -------------------------
    # STORE RESULT
    # -------------------------
    latest_brake = {
        "brake": {
            "status": brake_status,
            "message": brake_message
        },
        "balance": {
            "status": balance_status,
            "message": balance_message
        }
    }

    # Optional: Log to console (no alert card)
    print(f"🚗 Brake: {brake_status} | ⚖️ Balance: {balance_status}")


# --------------------------
# POST API (Simulator sends here)
# --------------------------
@router.post("/predict-brake")
def predict_brake(data: dict):
    process_brake_data(data)
    return latest_brake


# --------------------------
# GET API (Frontend reads here)
# --------------------------
@router.get("/latest")
def get_latest():
    return latest_brake