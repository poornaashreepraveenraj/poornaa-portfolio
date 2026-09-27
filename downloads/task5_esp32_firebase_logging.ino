/*
 * TASK 04 & TASK 05: ESP32 Firebase IoT Monitoring & Logging
 * Board: ESP32 Dev Module
 * Sensors: DHT11 (GPIO 4), LDR Analog (GPIO 34)
 * Actuator: Active-Low Relay (GPIO 26)
 * Database: Firebase Realtime Database
 * Sanitized for public release - Replace Wi-Fi and Firebase keys before upload.
 */

#define ENABLE_USER_AUTH
#define ENABLE_DATABASE

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <FirebaseClient.h>
#include <DHT.h>
#include <time.h>

#define WIFI_SSID       "YOUR_WIFI_SSID_HERE"
#define WIFI_PASSWORD   "YOUR_WIFI_PASSWORD_HERE"

#define API_KEY         "YOUR_FIREBASE_API_KEY_HERE"
#define DATABASE_URL    "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
#define USER_EMAIL      "user@example.com"
#define USER_PASSWORD   "YOUR_USER_PASSWORD_HERE"

#define DHT_PIN         4
#define DHT_TYPE        DHT11
#define LDR_PIN         34
#define RELAY_PIN       26

DHT dht(DHT_PIN, DHT_TYPE);

const unsigned long SENSOR_INTERVAL = 3000;
const unsigned long HISTORY_INTERVAL = 10000;

unsigned long lastSensorTime = 0;
unsigned long lastHistoryTime = 0;

int ldrThreshold = 2000;
String currentMode = "AUTOMATIC";
bool manualBulbState = false;
bool currentBulbState = false;

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); // Active-Low Relay OFF

  dht.begin();
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("
Connected to Wi-Fi!");

  // NTP Time setup
  configTime(19800, 0, "pool.ntp.org");
}

void loop() {
  unsigned long now = millis();

  if (now - lastSensorTime >= SENSOR_INTERVAL) {
    lastSensorTime = now;

    float temp = dht.readTemperature();
    float hum = dht.readHumidity();
    int ldr = analogRead(LDR_PIN);

    if (isnan(temp) || isnan(hum)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }

    // Determine relay state based on Mode
    if (currentMode == "MANUAL") {
      currentBulbState = manualBulbState;
    } else {
      currentBulbState = (ldr > ldrThreshold);
    }

    // Active-Low Relay Control: LOW = ON, HIGH = OFF
    digitalWrite(RELAY_PIN, currentBulbState ? LOW : HIGH);

    Serial.printf("Temp: %.1fC, Hum: %.1f%%, LDR: %d, Relay: %s
", 
                  temp, hum, ldr, currentBulbState ? "ON" : "OFF");
  }
}
