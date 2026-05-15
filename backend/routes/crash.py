from fastapi import APIRouter
from pydantic import BaseModel
import numpy as np
import joblib
import tensorflow as tf
from collections import deque
import requests
import os
import threading
import json  # ✅ Added for JSON parsing

router = APIRouter()

# -----------------------------
# LOAD MODEL
# -----------------------------
model = tf.keras.models.load_model("model/crash_model.h5")
scaler = joblib.load("model/scaler.pkl")

# ✅ MUST MATCH TRAINING SIZE
BUFFER_SIZE = 25
buffer = deque(maxlen=BUFFER_SIZE)

latest_reading = {
    "crash": False,
    "speed_alert": False
}

crash_notified = False

CRASH_PROB_THRESHOLD = 0.2
SPEED_ALERT_THRESHOLD = 70
ACCEL_THRESHOLD = 0.4  # Demo threshold for average acceleration

# -----------------------------
# CORE PROCESSING FUNCTION
# -----------------------------
def process_sensor_data(data):
    global latest_reading, crash_notified

    current = np.array([
        data["accel_x"],
        data["accel_y"],
        data["accel_z"],
        data["gyro_x"],
        data["gyro_y"],
        data["gyro_z"],
        data["speed"]
    ])

    buffer.append(current)
    print(f"[Sensor Data] {current}")

    # ✅ Wait until buffer fills
    if len(buffer) < BUFFER_SIZE:
        print(f"Waiting... {len(buffer)}/{BUFFER_SIZE}")
        return

    # -----------------------------
    # MODEL PREDICTION (kept for structure)
    # -----------------------------
    seq = np.array(buffer)
    seq_scaled = scaler.transform(seq)
    seq_scaled = seq_scaled.reshape(1, BUFFER_SIZE, 7)

    # -----------------------------
    # DEMO CRASH LOGIC BASED ON AVERAGE ACCELERATION
    # -----------------------------
    accel_avg = np.mean(np.linalg.norm(seq[:, :3], axis=1))
    crash_detected = accel_avg > ACCEL_THRESHOLD

    # -----------------------------
    # CRASH LOGIC
    # -----------------------------
    if crash_detected and not latest_reading["crash"]:
        latest_reading["crash"] = True
        print("🚨 Crash Detected!")

        if not crash_notified:
            try:
                EMAIL_NOTIFY = os.getenv(
                    "EMAIL_NOTIFY_URL",
                    "http://127.0.0.1:8000/notify/email"
                )

                email_to = data.get("emergency_email")
                if not email_to:
                    email_to = "sjaanu2005@gmail.com"

                response = requests.post(
                    EMAIL_NOTIFY,
                    json={
                        "to": email_to,
                        "subject": "MotoTwin Crash Alert!",
                        "message": "🚨 Crash detected! Immediate attention required."
                    },
                    timeout=5
                )

                print("📧 Email API response:", response.status_code, response.text)
                crash_notified = True

            except Exception as e:
                print("Email error:", e)

    elif not crash_detected:
        latest_reading["crash"] = False
        crash_notified = False

    # -----------------------------
    # SPEED ALERT
    # -----------------------------
    latest_reading["speed_alert"] = data["speed"] >= SPEED_ALERT_THRESHOLD

# -----------------------------
# OPTIONAL API (FOR TESTING)
# -----------------------------
class SensorData(BaseModel):
    accel_x: float
    accel_y: float
    accel_z: float
    gyro_x: float
    gyro_y: float
    gyro_z: float
    speed: float
    emergency_email: str = ""

@router.post("/predict")
def predict(data: SensorData):
    process_sensor_data(data.dict())
    return {"status": "processed"}

# -----------------------------
# FRONTEND FETCHES THIS
# -----------------------------
@router.get("/latest")
def get_latest():
    return latest_reading

# -----------------------------
# SERIAL LISTENER (AUTO)
# -----------------------------
def serial_listener():
    import serial
    import time

    try:
        ser = serial.Serial("COM5", 115200, timeout=1)
        print("📡 Serial started...")

        while True:
            line = ser.readline().decode(errors="ignore").strip()

            if not line:
                continue

            try:
                # ✅ Parse JSON line from Arduino
                data = json.loads(line)

                # Ensure all required keys exist
                required_keys = ["accel_x","accel_y","accel_z","gyro_x","gyro_y","gyro_z","speed"]
                if not all(k in data for k in required_keys):
                    print("Parse error: missing keys", line)
                    continue

                data["emergency_email"] = data.get("emergency_email", "")
                process_sensor_data(data)

            except json.JSONDecodeError:
                print("Parse error: invalid JSON:", line)
            except Exception as e:
                print("Parse error:", e)

            time.sleep(0.05)

    except Exception as e:
        print("Serial error:", e)

# -----------------------------
# START THREAD
# -----------------------------
threading.Thread(target=serial_listener, daemon=True).start()