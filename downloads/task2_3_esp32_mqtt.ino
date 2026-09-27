/*
 * TASK 02 & TASK 03: ESP32 Adafruit IO MQTT Relay Control
 * Shared codebase for Task 2 (Adafruit IO Dashboard) & Task 3 (IFTTT Voice Control)
 * Board: ESP32 Dev Module
 * Relay Pin: GPIO 23
 * Sanitized for public release - Replace credentials before upload.
 */

#include <WiFi.h>
#include "Adafruit_MQTT.h"
#include "Adafruit_MQTT_Client.h"

// Wi-Fi Credentials
#define WLAN_SSID       "YOUR_WIFI_SSID_HERE"
#define WLAN_PASS       "YOUR_WIFI_PASSWORD_HERE"

// Adafruit IO Credentials
#define AIO_SERVER      "io.adafruit.com"
#define AIO_SERVERPORT  1883
#define AIO_USERNAME    "YOUR_ADAFRUIT_USERNAME_HERE"
#define AIO_KEY         "YOUR_ADAFRUIT_AIO_KEY_HERE"

#define RELAY_PIN       23

WiFiClient client;
Adafruit_MQTT_Client mqtt(&client, AIO_SERVER, AIO_SERVERPORT, AIO_USERNAME, AIO_KEY);

// Subscribe to the relay feed
Adafruit_MQTT_Subscribe relayFeed = Adafruit_MQTT_Subscribe(&mqtt, AIO_USERNAME "/feeds/relay");

void MQTT_connect() {
  int8_t ret;
  if (mqtt.connected()) return;

  Serial.print("Connecting to MQTT... ");
  uint8_t retries = 3;
  while ((ret = mqtt.connect()) != 0) {
    Serial.println(mqtt.connectErrorString(ret));
    Serial.println("Retrying MQTT connection in 5 seconds...");
    mqtt.disconnect();
    delay(5000);
    retries--;
    if (retries == 0) {
      while (1);
    }
  }
  Serial.println("MQTT Connected!");
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  Serial.print("Connecting to ");
  Serial.println(WLAN_SSID);
  WiFi.begin(WLAN_SSID, WLAN_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("
WiFi connected!");

  mqtt.subscribe(&relayFeed);
}

void loop() {
  MQTT_connect();

  Adafruit_MQTT_Subscribe *subscription;
  while ((subscription = mqtt.readSubscription(5000))) {
    if (subscription == &relayFeed) {
      Serial.print(F("Got: "));
      char *val = (char *)relayFeed.lastread;
      Serial.println(val);

      String command = String(val);
      command.trim();

      if (command == "1" || command == "ON") {
        digitalWrite(RELAY_PIN, HIGH);
        Serial.println("Relay turned ON");
      } else if (command == "0" || command == "OFF") {
        digitalWrite(RELAY_PIN, LOW);
        Serial.println("Relay turned OFF");
      }
    }
  }

  if (!mqtt.ping()) {
    mqtt.disconnect();
  }
}
