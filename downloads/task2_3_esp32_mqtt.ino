/*
 * TASK 02 & TASK 03: ESP32 Adafruit IO MQTT Relay Control
 * Shared firmware for Task 2 (Adafruit IO dashboard) and Task 3 (IFTTT voice control)
 * Board: ESP32 Dev Module   Relay: GPIO 23   Feed: <username>/feeds/relay
 * This is the firmware that ran on the board. Credentials have been
 * replaced with placeholders for public release - fill them in before upload.
 */

#include <WiFi.h>
#include "Adafruit_MQTT.h"
#include "Adafruit_MQTT_Client.h"

// =================================================
// Wi-Fi
// =================================================

#define WIFI_SSID     "YOUR_WIFI_SSID_HERE"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD_HERE"

// =================================================
// Adafruit IO
// =================================================

#define AIO_SERVER     "io.adafruit.com"
#define AIO_SERVERPORT 1883

#define AIO_USERNAME   "YOUR_ADAFRUIT_USERNAME_HERE"

#define AIO_KEY        "YOUR_ADAFRUIT_AIO_KEY_HERE"

// =================================================
// Relay
// =================================================

#define RELAY_PIN 23

// =================================================
// Wi-Fi client
// =================================================

WiFiClient client;

// =================================================
// MQTT client
// =================================================

Adafruit_MQTT_Client mqtt(
  &client,
  AIO_SERVER,
  AIO_SERVERPORT,
  AIO_USERNAME,
  AIO_KEY
);

// =================================================
// Relay feed
// =================================================

Adafruit_MQTT_Subscribe relayFeed =
  Adafruit_MQTT_Subscribe(
    &mqtt,
    AIO_USERNAME "/feeds/relay"
  );

// =================================================
// SETUP
// =================================================

void setup() {

  Serial.begin(115200);

  delay(1000);

  Serial.println();
  Serial.println("================================");
  Serial.println("ESP32 SMART BULB");
  Serial.println("================================");

  // -------------------------------------------------
  // Relay
  // -------------------------------------------------

  pinMode(RELAY_PIN, OUTPUT);

  // LOW = OFF initially (this relay module switches ON with HIGH)
  digitalWrite(RELAY_PIN, LOW);

  Serial.println("Relay initialized OFF");

  // -------------------------------------------------
  // Wi-Fi
  // -------------------------------------------------

  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {

    delay(500);

    Serial.print(".");
  }

  Serial.println();
  Serial.println("Wi-Fi connected!");

  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // -------------------------------------------------
  // Subscribe to feed
  // -------------------------------------------------

  mqtt.subscribe(&relayFeed);

  Serial.println("Subscribed to:");
  Serial.println(AIO_USERNAME "/feeds/relay");
}

// =================================================
// MQTT CONNECTION
// =================================================

bool MQTT_connect() {

  if (mqtt.connected()) {
    return true;
  }

  Serial.println();
  Serial.println("Connecting to Adafruit IO...");

  int8_t ret = mqtt.connect();

  if (ret == 0) {

    Serial.println("Adafruit IO connected!");

    return true;
  }

  Serial.print("MQTT connection failed: ");
  Serial.println(mqtt.connectErrorString(ret));

  mqtt.disconnect();

  return false;
}

// =================================================
// MAIN LOOP
// =================================================

void loop() {

  if (!MQTT_connect()) {

    delay(5000);

    return;
  }

  Adafruit_MQTT_Subscribe *subscription;

  subscription = mqtt.readSubscription(1000);

  if (subscription == &relayFeed) {

    String command =
      (char *)relayFeed.lastread;

    command.trim();

    Serial.println();
    Serial.println("================================");
    Serial.print("MQTT MESSAGE: ");
    Serial.println(command);

    // -----------------------------------------------
    // ON
    // -----------------------------------------------

    if (command == "1" || command == "ON") {

      digitalWrite(RELAY_PIN, HIGH);

      Serial.println("RELAY: ON");
      Serial.println("BULB: ON");
    }

    // -----------------------------------------------
    // OFF
    // -----------------------------------------------

    else if (command == "0" || command == "OFF") {

      digitalWrite(RELAY_PIN, LOW);

      Serial.println("RELAY: OFF");
      Serial.println("BULB: OFF");
    }

    else {

      Serial.print("UNKNOWN VALUE: ");
      Serial.println(command);
    }

    Serial.println("================================");
  }
}
