/*
 * TASK 04 & TASK 05: ESP32 Firebase IoT Monitoring & Logging
 * Board: ESP32 Dev Module
 * Sensors: DHT11 (GPIO 4), LDR Analog (GPIO 34)
 * Actuator: Active-Low Relay (GPIO 26)
 * Database: Firebase Realtime Database (project: smartlightingiot)
 * Library: FirebaseClient by Mobizt (2.2.x)
 * This is the firmware that ran on the board. Credentials have been
 * replaced with placeholders for public release - fill them in before upload.
 */

#define ENABLE_USER_AUTH
#define ENABLE_DATABASE

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <FirebaseClient.h>
#include <DHT.h>
#include <time.h>

#define WIFI_SSID "YOUR_WIFI_SSID_HERE"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD_HERE"

#define API_KEY "YOUR_FIREBASE_WEB_API_KEY"

#define DATABASE_URL "https://YOUR_PROJECT_ID-default-rtdb.REGION.firebasedatabase.app"

#define USER_EMAIL "user@example.com"
#define USER_PASSWORD "YOUR_USER_PASSWORD_HERE"

#define DHT_PIN 4
#define DHT_TYPE DHT11

#define LDR_PIN 34
#define RELAY_PIN 26


DHT dht(DHT_PIN, DHT_TYPE);

WiFiClientSecure ssl_client;

using AsyncClient = AsyncClientClass;

AsyncClient aClient(ssl_client);

UserAuth user_auth(
    API_KEY,
    USER_EMAIL,
    USER_PASSWORD,
    3000
);

FirebaseApp app;

RealtimeDatabase Database;


unsigned long lastSensorRead = 0;
unsigned long lastHistoryLog = 0;

const unsigned long SENSOR_INTERVAL = 3000;
const unsigned long HISTORY_INTERVAL = 10000;


float temperature = 0;
float humidity = 0;

int ldrValue = 0;
int ldrThreshold = 2000;

bool bulbState = false;

String currentMode = "MANUAL";


void setup() {

    Serial.begin(115200);

    delay(1000);

    dht.begin();

    pinMode(LDR_PIN, INPUT);

    pinMode(RELAY_PIN, OUTPUT);

    digitalWrite(RELAY_PIN, HIGH);


    WiFi.begin(
        WIFI_SSID,
        WIFI_PASSWORD
    );

    Serial.print("Connecting to WiFi");

    while (WiFi.status() != WL_CONNECTED) {

        Serial.print(".");

        delay(500);

    }

    Serial.println();

    Serial.println("WiFi connected");


    ssl_client.setInsecure();


    initializeApp(
    aClient,
    app,
    getAuth(user_auth)
    );


    app.getApp<RealtimeDatabase>(Database);

    Database.url(DATABASE_URL);


    configTime(
        19800,
        0,
        "pool.ntp.org",
        "time.nist.gov"
    );


    Serial.println("Firebase initialized");

}


void loop() {

    app.loop();


    if (!app.ready()) {
        return;
    }


    unsigned long now = millis();


    if (
        now - lastSensorRead >=
        SENSOR_INTERVAL
    ) {

        lastSensorRead = now;

        readSensors();

        readControl();

        updateCurrentData();

    }


    if (
        now - lastHistoryLog >=
        HISTORY_INTERVAL
    ) {

        lastHistoryLog = now;

        logHistory();

    }

}


void readSensors() {

    float newTemperature =
        dht.readTemperature();

    float newHumidity =
        dht.readHumidity();


    if (!isnan(newTemperature)) {

        temperature =
            newTemperature;

    }


    if (!isnan(newHumidity)) {

        humidity =
            newHumidity;

    }


    ldrValue =
        analogRead(LDR_PIN);


    Serial.println();
    Serial.println("==============================");

    Serial.print("Temperature : ");
    Serial.print(temperature);
    Serial.println(" C");

    Serial.print("Humidity    : ");
    Serial.print(humidity);
    Serial.println(" %");

    Serial.print("LDR         : ");
    Serial.println(ldrValue);

    Serial.print("Threshold   : ");
    Serial.println(ldrThreshold);

    Serial.print("Mode        : ");
    Serial.println(currentMode);

    Serial.print("Bulb        : ");
    Serial.println(
        bulbState ? "ON" : "OFF"
    );

    Serial.println("==============================");

}


void readControl() {

    String mode =
        Database.get<String>(
            aClient,
            "/control/mode"
        );


    if (mode.length() > 0) {

        currentMode =
            mode;

        currentMode.toUpperCase();

    }


    int threshold =
        Database.get<int>(
            aClient,
            "/control/ldrThreshold"
        );


    if (threshold > 0) {

        ldrThreshold =
            threshold;

    }


    bool manualBulb =
        Database.get<bool>(
            aClient,
            "/control/bulbState"
        );


    /*
       MANUAL MODE
       Dashboard directly controls bulb.
    */

    if (currentMode == "MANUAL") {

        bulbState =
            manualBulb;

    }


    /*
       AUTO MODE

       Brightness:
       LDR < threshold
       → bulb OFF

       Darkness:
       LDR > threshold
       → bulb ON
    */

    else if (
        currentMode == "AUTO" ||
        currentMode == "AUTOMATIC"
    ) {

        if (
            ldrValue >
            ldrThreshold
        ) {

            bulbState = true;

        } else {

            bulbState = false;

        }

    }


    updateRelay();

}


void updateRelay() {

    /*
       Active LOW relay:

       LOW  = relay ON
       HIGH = relay OFF
    */

    if (bulbState) {

        digitalWrite(
            RELAY_PIN,
            LOW
        );

    } else {

        digitalWrite(
            RELAY_PIN,
            HIGH
        );

    }

}


void updateCurrentData() {

    Database.set<float>(
        aClient,
        "/current/temperature",
        temperature
    );


    Database.set<float>(
        aClient,
        "/current/humidity",
        humidity
    );


    Database.set<int>(
        aClient,
        "/current/ldr",
        ldrValue
    );


    Database.set<bool>(
        aClient,
        "/current/bulbState",
        bulbState
    );


    Database.set<String>(
        aClient,
        "/current/mode",
        currentMode
    );

}


String getTimestamp() {

    struct tm timeinfo;

    if (
        !getLocalTime(
            &timeinfo
        )
    ) {

        return "N/A";

    }


    char buffer[25];

    strftime(
        buffer,
        sizeof(buffer),
        "%Y-%m-%d %H:%M:%S",
        &timeinfo
    );


    return String(buffer);

}


void logHistory() {

    String timestamp =
        getTimestamp();


    String json = "{";

    json +=
        "\"temperature\":" +
        String(temperature, 1) +
        ",";

    json +=
        "\"humidity\":" +
        String(humidity, 1) +
        ",";

    json +=
        "\"ldr\":" +
        String(ldrValue) +
        ",";

    json +=
        "\"bulbState\":" +
        String(
            bulbState ? "true" : "false"
        ) +
        ",";

    json +=
        "\"mode\":\"" +
        currentMode +
        "\",";

    json +=
        "\"timestamp\":\"" +
        timestamp +
        "\"";

    json += "}";


    String result =
        Database.push<object_t>(
            aClient,
            "/history",
            object_t(json)
        );


    if (
        result.length() > 0
    ) {

        Serial.print(
            "History logged: "
        );

        Serial.println(result);

    } else {

        Serial.println(
            "History logging failed"
        );

        Serial.println(
            aClient.lastError().message()
        );

    }

}
