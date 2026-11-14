/*
 * TASK 01: ESP32 Web Server & Built-in LED Control
 * Board: ESP32 Dev Module
 * GPIO: Pin 2 (Onboard LED)
 * Serves the "BUILT-IN LED" control page: live LED status, ON/OFF buttons
 * and a GPIO / Wi-Fi / controller info strip.
 * Sanitized for public release - Replace WiFi credentials before upload.
 */

#include <WiFi.h>
#include <WebServer.h>

// Replace with your local Wi-Fi credentials
const char* ssid = "YOUR_WIFI_SSID_HERE";
const char* password = "YOUR_WIFI_PASSWORD_HERE";

WebServer server(80);
const int LED_PIN = 2;
bool ledOn = false;

// Page template. %ICON%, %STATE%, %DETAIL% and %ONCLASS% are filled in per request.
const char PAGE[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ESP32 Built-in LED</title>
<style>
  :root { --cream:#F3E7CC; --card:#EDDFBD; --ink:#243B4A; --steel:#577587; --gold:#D4B574; }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:var(--cream); color:var(--ink); font-family:Arial, Helvetica, sans-serif;
         min-height:100vh; display:flex; flex-direction:column; align-items:center; padding:24px 16px; }
  .rule { width:100%; max-width:860px; height:3px; background:var(--ink); position:relative; margin-bottom:40px; }
  .rule::after { content:""; position:absolute; left:50%; top:-7px; width:12px; height:12px;
                 background:var(--gold); border:2px solid var(--ink); transform:translateX(-50%) rotate(45deg); }
  .frame { width:100%; max-width:860px; border:4px solid var(--ink); background:var(--card);
           box-shadow:10px 10px 0 var(--ink); padding:14px; }
  .inner { border:1.5px solid var(--steel); padding:36px 28px 28px; }
  .top { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; flex-wrap:wrap; }
  h1 { font-family:Georgia, 'Times New Roman', serif; font-size:28px; letter-spacing:0.02em; }
  .sub { font-size:12px; letter-spacing:0.12em; color:var(--steel); margin-top:4px; }
  .badge { border:2px solid var(--ink); background:var(--gold); padding:6px 12px;
           font-size:12px; font-weight:bold; letter-spacing:0.08em; }
  .status { text-align:center; margin:36px 0; }
  .ring { width:200px; height:200px; margin:0 auto 24px; border-radius:50%; border:3px solid var(--steel);
          display:flex; align-items:center; justify-content:center; }
  .dot { width:176px; height:176px; border-radius:50%; border:5px solid var(--ink); background:#D9CFB6;
         display:flex; align-items:center; justify-content:center; font-size:72px; }
  .on .dot { background:var(--gold); }
  h2 { font-family:Georgia, 'Times New Roman', serif; font-size:36px; letter-spacing:0.06em; }
  .detail { font-size:14px; color:var(--steel); margin-top:6px; }
  .buttons { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:12px; }
  .btn { display:block; text-align:center; padding:18px 12px; border:3px solid var(--ink);
         box-shadow:6px 6px 0 var(--ink); font-weight:bold; font-size:14px; letter-spacing:0.18em;
         text-decoration:none; transition:transform .1s, box-shadow .1s; }
  .btn:active { transform:translate(4px,4px); box-shadow:2px 2px 0 var(--ink); }
  .btn-on { background:var(--steel); color:#FFFFFF; }
  .btn-off { background:var(--gold); color:var(--ink); }
  .stats { display:grid; grid-template-columns:repeat(3,1fr); border-top:1.5px solid var(--steel);
           margin-top:36px; padding-top:20px; text-align:center; }
  .stats div + div { border-left:1px solid var(--steel); }
  .stats b { display:block; font-family:Georgia, 'Times New Roman', serif; font-size:22px; }
  .stats span { font-size:11px; letter-spacing:0.14em; color:var(--steel); }
  @media (max-width:520px) { .buttons { grid-template-columns:1fr; } h2 { font-size:28px; } }
</style>
</head>
<body>
  <div class="rule"></div>
  <div class="frame">
    <div class="inner">
      <div class="top">
        <div>
          <h1>BUILT-IN LED</h1>
          <p class="sub">ESP32 DEV MODULE &bull; GPIO 2</p>
        </div>
        <div class="badge">&#9679; CONNECTED</div>
      </div>

      <div class="status %ONCLASS%">
        <div class="ring"><div class="dot">%ICON%</div></div>
        <h2>LED IS %STATE%</h2>
        <p class="detail">%DETAIL%</p>
      </div>

      <div class="buttons">
        <a class="btn btn-on" href="/on">TURN LED ON</a>
        <a class="btn btn-off" href="/off">TURN LED OFF</a>
      </div>

      <div class="stats">
        <div><b>02</b><span>GPIO PIN</span></div>
        <div><b>Wi-Fi</b><span>CONNECTION</span></div>
        <div><b>ESP32</b><span>CONTROLLER</span></div>
      </div>
    </div>
  </div>
</body>
</html>
)rawliteral";

void handleRoot() {
  String html = FPSTR(PAGE);
  html.replace("%ONCLASS%", ledOn ? "on" : "");
  html.replace("%ICON%", ledOn ? "&#9679;" : "&#9675;");
  html.replace("%STATE%", ledOn ? "ON" : "OFF");
  html.replace("%DETAIL%", ledOn ? "The built-in indicator is currently active."
                                 : "The built-in indicator is currently inactive.");
  // Declaring UTF-8 here (and in the <meta> tag) keeps symbols from showing as garbled text
  server.send(200, "text/html; charset=utf-8", html);
}

void handleOn() {
  ledOn = true;
  digitalWrite(LED_PIN, HIGH);
  server.sendHeader("Location", "/");
  server.send(303);
}

void handleOff() {
  ledOn = false;
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

  // Give up after ~20 s instead of printing dots forever, and show why
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println("");

  if (WiFi.status() != WL_CONNECTED) {
    Serial.print("Wi-Fi connection FAILED, status code ");
    Serial.println(WiFi.status());
    return;
  }

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
