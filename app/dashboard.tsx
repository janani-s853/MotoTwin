import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import axios from "axios";
import * as Location from "expo-location";
import { createClient } from "@supabase/supabase-js";
import Brake from "./brake";
import Geofence from "./geofence";

const SUPABASE_URL = "https://lamofoaiznmraetwgbfw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbW9mb2Fpem5tcmFldHdnYmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MjA5MTQsImV4cCI6MjA4MjM5NjkxNH0.cZSvm-PajM97AlmmmxQtkk5WntXHeIUoGiT5PU6awWk";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function Dashboard() {
  const [crashStatus, setCrashStatus] = useState("Normal");
  const [speedAlert, setSpeedAlert] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [placeName, setPlaceName] = useState("Fetching location...");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [emergencyEmail, setEmergencyEmail] = useState("");

  const FASTAPI_LATEST = "http://192.168.0.102:8000/crash/latest";

  const crashNotifiedRef = useRef(false);

  // ✅ Fetch emergency email (correct column)
  const fetchEmergencyContact = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("emergency_email")
        .limit(1)
        .single();

      if (!error && data?.emergency_email) {
        setEmergencyEmail(data.emergency_email);
      }
    } catch (err) {
      console.log("Error fetching emergency contact:", err);
    }
  };

  // ✅ Get REAL location (no hardcoding)
  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      setLocation(coords);

      // Convert lat/lng → readable address
      const [address] = await Location.reverseGeocodeAsync(coords);

      const formattedPlace =
        address?.name
          ? `${address.name}, ${address.city || address.region || ""}`
          : `${address?.street || ""}, ${address?.city || address?.region || ""}`;

      setPlaceName(formattedPlace);
      setLoading(false);
    } catch (err) {
      console.log("Location error:", err);
    }
  };

  // ✅ Main loop (ONLY fetch backend results)
  useEffect(() => {
    fetchEmergencyContact();

    const interval = setInterval(async () => {
      await getLocation();

      try {
        const response = await axios.get(FASTAPI_LATEST);
        const data = response?.data;

        const crash = data?.crash || false;
        const speed = data?.speed_alert || false;

        setCrashStatus(crash ? "Crash/Skid" : "Normal");
        setSpeedAlert(speed);
        setTime(new Date().toLocaleString());

        // 🚨 Crash alert (only once)
        if (crash && !crashNotifiedRef.current) {
          Alert.alert("🚨 Crash Detected!", `Crash at ${placeName}`);
          crashNotifiedRef.current = true;
        } else if (!crash) {
          crashNotifiedRef.current = false;
        }

        // ⚠️ Speed alert
        if (speed) {
          Alert.alert("⚠️ Ride Slow!", "Speed is high, please slow down.");
        }

      } catch (err) {
        console.log("Crash fetch error:", err);
      }
    }, 3000); // stable interval

    return () => clearInterval(interval);
  }, []);

  if (loading || !location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ffcc" />
        <Text style={styles.loadingText}>Fetching live location...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>MotoTwin Dashboard</Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusText}>
          Status:{" "}
          <Text
            style={{
              color: crashStatus === "Crash/Skid" ? "#ff4d4d" : "#00ff88",
              fontWeight: "bold",
            }}
          >
            {crashStatus}
          </Text>
        </Text>

        {speedAlert && <Text style={styles.warning}>⚠️ Ride Slow!</Text>}

        <Text style={styles.timeText}>Time: {time}</Text>
        <Text style={styles.timeText}>Location: {placeName}</Text>
      </View>

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        <Marker
          coordinate={location}
          title={placeName}
          description={
            crashStatus === "Crash/Skid"
              ? "Crash Detected!"
              : "Normal Ride"
          }
          pinColor={
            crashStatus === "Crash/Skid" ? "#ff4d4d" : "#00ff88"
          }
        />
      </MapView>

      {/* Modules */}
      <Brake />
      <Geofence />
    </ScrollView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#00ffcc",
    textAlign: "center",
    marginVertical: 15,
  },
  statusCard: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    marginHorizontal: 15,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  statusText: { color: "#fff", fontSize: 18, marginBottom: 10 },
  warning: { color: "#ffcc00", fontWeight: "bold", fontSize: 16 },
  timeText: { color: "#aaa", fontSize: 14 },
  map: {
    width: width - 30,
    height: 350,
    marginHorizontal: 15,
    borderRadius: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loadingText: { color: "#00ffcc", marginTop: 10 },
});