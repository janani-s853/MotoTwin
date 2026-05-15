# MotoTwin - Smart Two Wheeler Predictive Maintenance System

MotoTwin is an IoT-enabled smart two-wheeler monitoring and predictive maintenance platform designed to improve rider safety and vehicle reliability through real-time monitoring, fault prediction, and emergency detection systems.

The system continuously monitors critical vehicle parameters such as braking systems, vehicle balance, crash impact, and riding behavior using sensors and machine learning models.

---

# Features

## Predictive Maintenance & Fault Detection
- Real-time monitoring of brake systems and vehicle balance
- Early fault prediction using sensor data
- 1D Convolutional Neural Network (1D-CNN) based analysis

## Crash Detection System
- Detects accidents using sensor readings
- Sends emergency alerts and notifications
- Helps improve rider safety during emergencies

## Geofencing System
- Location-based vehicle tracking
- Real-time monitoring of vehicle movement
- Alerts for boundary violations

## Auto Turn Indicator
- Automatically detects vehicle turning direction
- Activates turn indicators automatically
- Enhances road safety and rider convenience

## Real-Time Mobile Application
- Live monitoring of vehicle status
- Instant notifications and alerts
- Mobile interface built using React Native

---

# Tech Stack

## Frontend
- React Native

## Backend
- Python
- FastAPI

## Database & Cloud
- Supabase

## Machine Learning
- 1D Convolutional Neural Network (1D-CNN)

## Hardware & IoT
- Arduino IDE
- Sensors and Microcontroller Modules

---

# Project Architecture

```text
Sensors -> Arduino -> FastAPI Backend -> Supabase Database -> React Native App
