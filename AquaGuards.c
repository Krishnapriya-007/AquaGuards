#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ---------- WIFI ----------
#define WIFI_SSID "Firmware"
#define WIFI_PASSWORD "Solutions@12345"

// ---------- FIREBASE ----------
String firebaseHost = "https://aquaguards-e4a0a-default-rtdb.asia-southeast1.firebasedatabase.app";

// ---------- LCD ----------
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ---------- TEMP ----------
#define ONE_WIRE_BUS 4
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// ---------- SENSORS ----------
#define TURBIDITY_PIN 34
#define TDS_PIN 35

// ---------- RGB LED ----------
#define RED 16
#define GREEN 17
#define BLUE 18

// ---------- BUZZER ----------
#define BUZZER 23

void setup() {
  Serial.begin(115200);

  // WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nWiFi Connected");

  // LCD
  lcd.init();
  lcd.backlight();

  // Sensors
  sensors.begin();

  // LED + Buzzer
  pinMode(RED, OUTPUT);
  pinMode(GREEN, OUTPUT);
  pinMode(BLUE, OUTPUT);
  pinMode(BUZZER, OUTPUT);

  lcd.setCursor(0, 0);
  lcd.print("System Starting");
  delay(2000);
}

void loop() {

  // -------- READ SENSORS --------
  sensors.requestTemperatures();
  float temp = sensors.getTempCByIndex(0);

  int turb = analogRead(TURBIDITY_PIN);

  int tdsRaw = analogRead(TDS_PIN);
  float voltage = tdsRaw * (3.3 / 4095.0);
  float tds = (133.42 * voltage * voltage * voltage
              - 255.86 * voltage * voltage
              + 857.39 * voltage) * 0.5;

  // -------- RESET OUTPUT --------
  digitalWrite(RED, LOW);
  digitalWrite(GREEN, LOW);
  digitalWrite(BLUE, LOW);
  noTone(BUZZER);

  String status = "";

  // -------- TEMPERATURE-ONLY LOGIC --------
  if (temp >= 22 && temp <= 30) {
    status = "SAFE";
    digitalWrite(GREEN, HIGH);
  }
  else if ((temp >= 18 && temp < 22) || (temp > 30 && temp <= 35)) {
    status = "WARNING";
    digitalWrite(RED, HIGH);
    digitalWrite(GREEN, HIGH); // Yellow
  }
  else {
    status = "HIGH RISK";
    digitalWrite(RED, HIGH);
    tone(BUZZER, 2000);
  }

  // -------- LCD DISPLAY --------
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("T:");
  lcd.print(temp,1);

  lcd.setCursor(0, 1);
  lcd.print(status);

  // -------- SERIAL --------
  Serial.println("------------");
  Serial.print("Temp: "); Serial.println(temp);
  Serial.print("TDS: "); Serial.println(tds);
  Serial.print("Turbidity: "); Serial.println(turb);
  Serial.print("STATUS: "); Serial.println(status);

  // -------- SEND TO FIREBASE --------
  if (WiFi.status() == WL_CONNECTED) {

    HTTPClient http;

    // Temperature
    http.begin(firebaseHost + "/Water/Temperature.json");
    http.addHeader("Content-Type", "application/json");
    http.PUT(String(temp));
    http.end();

    // Turbidity
    http.begin(firebaseHost + "/Water/Turbidity.json");
    http.addHeader("Content-Type", "application/json");
    http.PUT(String(turb));
    http.end();

    // TDS
    http.begin(firebaseHost + "/Water/TDS.json");
    http.addHeader("Content-Type", "application/json");
    http.PUT(String(tds));
    http.end();

    // Status (based ONLY on temperature)
    http.begin(firebaseHost + "/Water/Status.json");
    http.addHeader("Content-Type", "application/json");
    http.PUT("\"" + status + "\"");
    http.end();

    Serial.println("Data Sent to Firebase ✔");
  }

  Serial.println("----------------------");

  delay(3000);
}