/*
 * TASK 01: ESP32 Web Server & Built-in LED Control
 * Board: ESP32 Dev Module
 * GPIO: Pin 2 (Onboard LED)
 * Sanitized for public release - Replace WiFi credentials before upload.
 */

#include <WiFi.h>
#include <WebServer.h>

// Replace with your local Wi-Fi credentials
const char* ssid = "YOUR_WIFI_SSID_HERE";
const char* password = "YOUR_WIFI_PASSWORD_HERE";

WebServer server(80);
const int LED_PIN = 2;

void handleRoot() {
  String html = "<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width, initial-scale=1'>";
  html += "<title>ESP32 LED Control</title>";
  html += "<style>body{font-family:Arial;text-align:center;margin-top:50px;}";
  html += ".btn{display:inline-block;padding:15px 30px;font-size:18px;color:white;border:none;border-radius:8px;text-decoration:none;margin:10px;}";
  html += ".on{background-color:#4CAF50;} .off{background-color:#f44336;}</style></head><body>";
  html += "<h2>ESP32 Web Server LED Control</h2>";
  html += "<a href='/on' class='btn on'>TURN LED ON</a>";
  html += "<a href='/off' class='btn off'>TURN LED OFF</a>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

void handleOn() {
  digitalWrite(LED_PIN, HIGH);
  server.sendHeader("Location", "/");
  server.send(303);
}

void handleOff() {
  digitalWrite(LED_PIN, LOW);
  server.sendHeader("Location", "/");
  server.send(303);
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  Serial.println("Connecting to Wi-Fi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("Wi-Fi connected.");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  server.on("/", handleRoot);
  server.on("/on", handleOn);
  server.on("/off", handleOff);

  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();
}
