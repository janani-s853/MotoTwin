#include <Wire.h>
#include "MPU6050.h"

MPU6050 mpu;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  mpu.initialize();
}

void loop() {
  float ax = mpu.getAccelerationX() / 16384.0;
  float ay = mpu.getAccelerationY() / 16384.0;
  float az = mpu.getAccelerationZ() / 16384.0;
  float gx = mpu.getRotationX() / 131.0;
  float gy = mpu.getRotationY() / 131.0;
  float gz = mpu.getRotationZ() / 131.0;
  float speed = 70; // example speed

  // Print JSON
  Serial.print("{");
  Serial.print("\"accel_x\":" + String(ax) + ",");
  Serial.print("\"accel_y\":" + String(ay) + ",");
  Serial.print("\"accel_z\":" + String(az) + ",");
  Serial.print("\"gyro_x\":" + String(gx) + ",");
  Serial.print("\"gyro_y\":" + String(gy) + ",");
  Serial.print("\"gyro_z\":" + String(gz) + ",");
  Serial.print("\"speed\":" + String(speed));
  Serial.println("}");

  delay(1000);
}
