#include <Wire.h>
#include <MPU6050.h>

MPU6050 mpu;

int leftLED = 27;
int rightLED = 19;

int tiltThreshold = 3000;  // adjust based on your sensor

unsigned long previousMillisLeft = 0;
unsigned long previousMillisRight = 0;
int blinkInterval = 500; // blink every 500ms
bool ledStateLeft = false;
bool ledStateRight = false;

void setup() {
  Serial.begin(115200);

  pinMode(leftLED, OUTPUT);
  pinMode(rightLED, OUTPUT);

  Wire.begin(21, 22);

  Serial.println("Initializing MPU6050...");

  mpu.initialize();

  if(mpu.testConnection()){
    Serial.println("MPU6050 connected");
  }
  else{
    Serial.println("MPU NOT WORKING");
  }
}

void loop() {
  int16_t ax, ay, az;
  mpu.getAcceleration(&ax, &ay, &az);

  Serial.print("AX: ");
  Serial.println(ax);

  unsigned long currentMillis = millis();

  // LEFT TURN
  if(ax > tiltThreshold){
    // Blink left LED
    if(currentMillis - previousMillisLeft >= blinkInterval){
      previousMillisLeft = currentMillis;
      ledStateLeft = !ledStateLeft;
      digitalWrite(leftLED, ledStateLeft ? HIGH : LOW);
    }
    digitalWrite(rightLED, LOW);  // ensure right LED off
    ledStateRight = false;        // reset right state
    Serial.println("LEFT TURN");
  }

  // RIGHT TURN
  else if(ax < -tiltThreshold){
    // Blink right LED
    if(currentMillis - previousMillisRight >= blinkInterval){
      previousMillisRight = currentMillis;
      ledStateRight = !ledStateRight;
      digitalWrite(rightLED, ledStateRight ? HIGH : LOW);
    }
    digitalWrite(leftLED, LOW);   // ensure left LED off
    ledStateLeft = false;         // reset left state
    Serial.println("RIGHT TURN");
  }

  // STRAIGHT
  else{
    digitalWrite(leftLED, LOW);
    digitalWrite(rightLED, LOW);
    ledStateLeft = false;
    ledStateRight = false;
    previousMillisLeft = currentMillis;
    previousMillisRight = currentMillis;
    Serial.println("STRAIGHT");
  }

  delay(50);  // small delay to stabilize readings
}
