import serial
import json
import requests
import time

# ---------------- CONFIG ----------------
SERIAL_PORT = "COM5"
BAUD_RATE = 115200
FASTAPI_URL = "http://192.168.0.102:8000/crash/predict"  # FastAPI endpoint
NOTIFY_URL = "http://192.168.0.102:8000/notify/email"    # Notification endpoint
READ_TIMEOUT = 1
POST_TIMEOUT = 5
SLEEP_INTERVAL = 0.1
# ---------------------------------------

def main():
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=READ_TIMEOUT)
        print(f"[Serial] Listening on {SERIAL_PORT} at {BAUD_RATE} baud")
    except serial.SerialException as e:
        print(f"⚠️ Could not open serial port {SERIAL_PORT}: {e}")
        return

    while True:
        try:
            raw_line = ser.readline().strip()
            if not raw_line:
                continue

            # Decode bytes safely
            try:
                line = raw_line.decode("utf-8", errors="ignore")
            except UnicodeDecodeError:
                continue

            # Parse JSON from Arduino
            try:
                data = json.loads(line)
            except json.JSONDecodeError:
                print(f"⚠️ Invalid JSON: {line}")
                continue

            # Send to FastAPI
            try:
                response = requests.post(FASTAPI_URL, json=data, timeout=POST_TIMEOUT)
                res_json = response.json()

                # Extract fields
                crash = res_json.get("crash", False)
                speed_alert = res_json.get("speed_alert", False)
                crash_prob = res_json.get("crash_prob", 0.0)  # Optional if API returns probability

                # Print results
                print(f"[Arduino] {data} → Crash: {crash}, Crash Prob: {crash_prob}, Speed Alert: {speed_alert}")

                # Local alerts
                if crash:
                    print("🚨 Crash Detected!")
                    # Trigger email/notification automatically
                    try:
                        requests.post(NOTIFY_URL, json={"crash": True}, timeout=POST_TIMEOUT)
                        print("📧 Email sent for crash")
                    except requests.exceptions.RequestException as e:
                        print(f"⚠️ Notification API error: {e}")

                if speed_alert:
                    print("⚠️ Speed alert! Ride slow.")

            except requests.exceptions.RequestException as e:
                print(f"⚠️ Error posting to FastAPI: {e}")

            time.sleep(SLEEP_INTERVAL)

        except KeyboardInterrupt:
            print("Exiting serial bridge...")
            break
        except Exception as e:
            print(f"⚠️ Unexpected error: {e}")
            time.sleep(SLEEP_INTERVAL)

if __name__ == "__main__":
    main()