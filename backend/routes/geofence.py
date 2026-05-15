from fastapi import APIRouter, HTTPException
import math
import requests
from supabase import create_client

router = APIRouter()

# 🔐 Supabase config
SUPABASE_URL = "your_supabase_url"
SUPABASE_KEY = "your_supabase_key"
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

RADIUS = 100  # meters


# 📏 Distance function (Haversine)
def distance(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@router.post("/check")
def check_geofence(data: dict):
    try:
        lat = data.get("latitude")
        lon = data.get("longitude")
        email = data.get("email")

        if lat is None or lon is None:
            raise HTTPException(status_code=400, detail="Missing latitude/longitude")

        # 🔥 FETCH HOME LOCATION FROM DB
        res = supabase.table("profiles").select("latitude, longitude").limit(1).execute()

        if not res.data:
            raise HTTPException(status_code=404, detail="Home location not set")

        home_lat = res.data[0]["latitude"]
        home_lon = res.data[0]["longitude"]

        # 📏 Calculate distance
        dist = distance(lat, lon, home_lat, home_lon)

        # 🔥 OPTIONAL: Convert home lat/lon → address (simple string)
        home_address = f"{home_lat:.5f}, {home_lon:.5f}"

        # 🚨 Outside condition
        if dist > RADIUS:

            # 📧 Send email
            if email:
                try:
                    requests.post(
                        "http://127.0.0.1:8000/notify/email",
                        json={
                            "to": email,
                            "subject": "🚨 Geofence Alert",
                            "message": f"Vehicle moved outside safe zone!\nDistance: {dist:.2f} meters"
                        },
                        timeout=3
                    )
                except Exception as e:
                    print("Email error:", e)

            return {
                "status": "Outside",
                "distance": dist,
                "home_address": home_address
            }

        return {
            "status": "Inside",
            "distance": dist,
            "home_address": home_address
        }

    except Exception as e:
        print("Geofence Error:", e)
        raise HTTPException(status_code=500, detail=str(e))
