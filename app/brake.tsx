import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";

export default function Brake() {
  // ✅ Default values (clean UI)
  const [brakeStatus, setBrakeStatus] = useState("Healthy");
  const [balanceStatus, setBalanceStatus] = useState("Stable");
  const [loading, setLoading] = useState(true); // Fixed loading state

  // ✅ CORRECT API (GET latest result)
  const BRAKE_API = "http://192.168.0.102:8000/brake/latest";

useEffect(() => {
  const interval = setInterval(async () => {
    try {
      // ✅ ONLY fetch latest processed result
      const response: any = await axios.get(BRAKE_API); // cast as any

      const brake = response?.data?.brake?.status || "Healthy";
      const balance = response?.data?.balance?.status || "Stable";

      setBrakeStatus(brake);
      setBalanceStatus(balance);
      setLoading(false);

    } catch (err: any) {
      console.log("Brake API error:", err?.message);

      // ❌ Fallback to defaults, no alert
      setBrakeStatus("Healthy");
      setBalanceStatus("Stable");
      setLoading(false);
    }
  }, 2000);

  return () => clearInterval(interval);
}, []);

  // 🎨 Brake color
  const getBrakeColor = () => {
    switch (brakeStatus) {
      case "Healthy":
        return "#00ff88"; // Green
      case "Likely Faulty":
        return "#ffcc00"; // Yellow
      case "Faulty":
        return "#ff4d4d"; // Red
      default:
        return "#aaa"; // Gray
    }
  };

  // 🎨 Balance color
  const getBalanceColor = () => {
    switch (balanceStatus) {
      case "Stable":
        return "#00ff88"; // Green
      case "Moderate":
        return "#ffcc00"; // Yellow
      case "Unstable":
        return "#ff4d4d"; // Red
      default:
        return "#aaa"; // Gray
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Vehicle Health</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#00ffcc" />
      ) : (
        <>
          {/* Brake */}
          <Text style={styles.label}>Brake Condition</Text>
          <Text style={[styles.status, { color: getBrakeColor() }]}>
            {brakeStatus}
          </Text>

          {/* Balance */}
          <Text style={styles.label}>Balance Stability</Text>
          <Text style={[styles.status, { color: getBalanceColor() }]}>
            {balanceStatus}
          </Text>
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
    shadowColor: "#00ffcc",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#00ffcc",
    marginBottom: 15,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    color: "#aaa",
    marginTop: 10,
  },
  status: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
});