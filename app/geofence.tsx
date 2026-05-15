import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import axios from "axios";
import * as Location from "expo-location";

export default function Geofence() {
  const [status, setStatus] = useState("Inside");
  const [distance, setDistance] = useState(0);
  const [currentPlace, setCurrentPlace] = useState("Fetching...");
  const [homePlace, setHomePlace] = useState("Home Location");
  const [loading, setLoading] = useState(true);

  const API = "http://192.168.0.102:8000/geofence/check";

  // 🚨 prevent repeated alerts
  const alertShownRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // 📍 Get REAL location
        const { status: perm } = await Location.requestForegroundPermissionsAsync();
        if (perm !== "granted") return;

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };

        // 📍 Convert to address
        const [address] = await Location.reverseGeocodeAsync(coords);

        const currentAddr =
          address?.name
            ? `${address.name}, ${address.city || address.region || ""}`
            : `${address?.street || ""}, ${address?.city || address?.region || ""}`;

        setCurrentPlace(currentAddr);

        // 🚀 Send to backend (backend compares with DB home location)
        const response = await axios.post(API, coords);

        const data = response?.data;

        const newStatus = data?.status || "Inside";
        const dist = data?.distance || 0;
        const home = data?.home_address || "Home Location";

        setStatus(newStatus);
        setDistance(dist);
        setHomePlace(home);

        setLoading(false);

        // 🚨 ALERT ONLY ONCE
        if (newStatus === "Outside" && !alertShownRef.current) {
          Alert.alert(
            "🚨 Geofence Alert",
            `Vehicle moved from ${home} to ${currentAddr}`
          );
          alertShownRef.current = true;
        }

        if (newStatus === "Inside") {
          alertShownRef.current = false;
        }

      } catch (err) {
        console.log("Geofence error:", err);
        // ❌ don’t show error in UI
        setStatus("Inside");
        setLoading(false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getColor = () => {
    return status === "Inside" ? "#00ff88" : "#ff4d4d";
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Geofence Status</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#00ffcc" />
      ) : (
        <>
          <Text style={[styles.status, { color: getColor() }]}>
            {status}
          </Text>

          <Text style={styles.info}>
            Distance: {distance.toFixed(2)} meters
          </Text>

          {/* 📍 Movement Info (VERY IMPORTANT FOR DEMO) */}
          {status === "Outside" && (
            <Text style={styles.alert}>
              🚗 Moved from {homePlace} → {currentPlace}
            </Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    marginHorizontal: 15,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00ffcc",
    marginBottom: 10,
  },
  status: {
    fontSize: 26,
    fontWeight: "bold",
  },
  info: {
    color: "#aaa",
    marginTop: 5,
  },
  alert: {
    color: "#ff4d4d",
    marginTop: 10,
    fontSize: 14,
  },
});