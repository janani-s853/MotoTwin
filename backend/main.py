# main.py

from fastapi import FastAPI
from routes import crash, notify, brake, geofence
import serial
import json
import requests
import time
import threading

# -----------------------------
# FastAPI App
# -----------------------------
app = FastAPI(
    title="MotoTwin API",
    description="Crash + Brake + Geofence System",
    version="1.0"
)

# Routers
app.include_router(crash.router, prefix="/crash", tags=["Crash Detection"])
app.include_router(notify.router, prefix="/notify", tags=["Notifications"])
app.include_router(brake.router, prefix="/brake", tags=["Brake Detection"])
app.include_router(geofence.router, prefix="/geofence", tags=["Geofencing"])

@app.get("/")
def root():
    return {"message": "MotoTwin API Running"}

# -----------------------------
# Serial Config (Crash Detection)
# -----------------------------
SERIAL_PORT = "COM5"          # change if needed
BAUD_RATE = 115200
FASTAPI_CRASH_URL = "http://127.0.0.1:8000/crash/predict"  # LAN IP if Arduino is remote
POST_TIMEOUT = 10             # Increase timeout to 10 seconds
SLEEP_INTERVAL = 0.1

# -----------------------------
# Check Arduino Connection
# -----------------------------
def is_arduino_connected():
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        ser.close()
        return True
    except:
        return False

# -----------------------------
# Serial Loop (Crash)
# -----------------------------
def read_serial_loop():
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=5)
        print(f"🚀 Crash Detection ENABLED (Connected to {SERIAL_PORT})")
    except Exception as e:
        print(f"❌ Crash Detection DISABLED (No Arduino): {e}")
        return

    while True:
        try:
            raw_line = ser.readline()
            if not raw_line:
                continue

            try:
                line = raw_line.decode('utf-8', errors='ignore').strip()
            except Exception:
                continue

            try:
                data = json.loads(line)
            except json.JSONDecodeError:
                print(f"⚠️ Invalid JSON: {line}")
                continue

            # Send data to FastAPI asynchronously to avoid blocking
            threading.Thread(target=post_to_fastapi, args=(data,), daemon=True).start()

            time.sleep(SLEEP_INTERVAL)

        except KeyboardInterrupt:
            print("Exiting serial loop...")
            break
        except Exception as e:
            print(f"⚠️ Unexpected error: {e}")
            time.sleep(SLEEP_INTERVAL)

# -----------------------------
# Function: POST to FastAPI
# -----------------------------
def post_to_fastapi(data):
    try:
        response = requests.post(FASTAPI_CRASH_URL, json=data, timeout=POST_TIMEOUT)
        print("Arduino (Crash):", data, "→", response.json())
    except requests.exceptions.RequestException as e:
        print(f"⚠️ API Error: {e}")

# -----------------------------
# Startup Event
# -----------------------------
@app.on_event("startup")
def startup_event():
    if is_arduino_connected():
        thread = threading.Thread(target=read_serial_loop, daemon=True)
        thread.start()
    else:
        print("✅ Running WITHOUT Crash Detection (Brake + Geofence only)")