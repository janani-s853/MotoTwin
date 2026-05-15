# brake_simulator.py
import requests
import time
import random

# Use your LAN IP if testing with mobile
BRAKE_URL = "http://127.0.0.1:8000/brake/predict-brake"

def generate_sample():
    """
    Simulate brake + balance sensor readings
    """
    return {
        "deceleration": round(random.uniform(0, 10), 2),
        "vibration": round(random.uniform(0, 5), 2),
        "tilt_x": round(random.uniform(-5, 5), 2),
        "tilt_y": round(random.uniform(-5, 5), 2),
        "angular_velocity": round(random.uniform(0, 10), 2),
        "response_time": round(random.uniform(0.5, 2.0), 2)
    }

def main():
    print("🚀 Starting Brake + Balance Simulator...\n")

    while True:
        sample = generate_sample()

        try:
            response = requests.post(BRAKE_URL, json=sample)
            data = response.json()

            brake_status = data["brake"]["status"]
            balance_status = data["balance"]["status"]

            print(f"""
Sample: {sample}

🚗 Brake Status   : {brake_status}
⚖️ Balance Status : {balance_status}
----------------------------------------
""")

        except Exception as e:
            print(f"❌ Error sending data: {e}")

        time.sleep(1)

if __name__ == "__main__":
    main()