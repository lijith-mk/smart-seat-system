// ===============================
// SMART SEAT DETECTION (FSR + PIR Display) - WiFi Version
// ESP32 + FSR400 + HC-SR501
// ===============================

#include <WiFi.h>
#include <HTTPClient.h>

// WiFi credentials - UPDATE THESE WITH YOUR NETWORK DETAILS
const char* ssid = "CMF by nothing";        // Change this to your WiFi name
const char* password = "55555555"; // Change this to your WiFi password
PS C:\Users\lijit\Desktop\seatsmart> docker-compose up --build
time="2025-10-13T09:03:52+05:30" level=warning msg="C:\\Users\\lijit\\Desktop\\seatsmart\\docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion"
unable to get image 'seatsmart-seatsmart-server': error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.51/images/seatsmart-seatsmart-server/json": open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
// Server details - UPDATE THIS WITH YOUR COMPUTER'S IP ADDRESS
const char* serverAddress = "http://172.20.161.184:3001"; // Updated to your computer's IP
const char* endpoint = "/api/sensor-data";

// Pin connections
#define FSR_PIN 34     // FSR analog pin
#define PIR_PIN 17     // PIR digital pin
#define LED_PIN 5      // LED indicator

int fsrBaseline = 0;
bool occupied = false;
unsigned long lastCheck = 0;
const unsigned long interval = 100; // check every 100 ms
unsigned long lastWifiAttempt = 0;
const unsigned long wifiInterval = 5000; // retry WiFi every 5 seconds

void setup() {
  Serial.begin(115200);
  pinMode(FSR_PIN, INPUT);
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);

  // ===== Calibrate baseline =====
  long sum = 0;
  Serial.println("Calibrating FSR... keep seat empty!");
  for (int i = 0; i < 100; i++) {
    sum += analogRead(FSR_PIN);
    delay(10);
  }
  fsrBaseline = sum / 100;
  Serial.print("Baseline set to: ");
  Serial.println(fsrBaseline);
  
  // ===== Connect to WiFi =====
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  
  // Wait for connection
  while (WiFi.status() != WL_CONNECTED && millis() < 10000) {
    delay(500);
    Serial.print(".");
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("");
    Serial.println("Failed to connect to WiFi");
  }
  
  Serial.println("Setup complete!");
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Non-blocking check every 100 ms
  if (currentMillis - lastCheck >= interval) {
    lastCheck = currentMillis;

    // ===== Read sensors =====
    int fsrValue = analogRead(FSR_PIN);
    int pirValue = digitalRead(PIR_PIN);
    int delta = fsrValue - fsrBaseline;
    if (delta < 0) delta = 0;

    // ===== Occupancy logic =====
    occupied = (delta > 500 || pirValue == HIGH);

    // ===== LED Indicator =====
    digitalWrite(LED_PIN, occupied ? HIGH : LOW);

    // ===== Send data over WiFi =====
    if (WiFi.status() == WL_CONNECTED) {
      sendDataOverWiFi(fsrValue, delta, pirValue, occupied);
    } else if (currentMillis - lastWifiAttempt >= wifiInterval) {
      // Try to reconnect to WiFi
      lastWifiAttempt = currentMillis;
      Serial.println("Attempting to reconnect to WiFi...");
      WiFi.begin(ssid, password);
    }

    // ===== Serial Monitor Output (for debugging) =====
    Serial.print("FSR: ");
    Serial.print(fsrValue);
    Serial.print(" | Δ: ");
    Serial.print(delta);
    Serial.print(" | PIR: ");
    Serial.print(pirValue);
    Serial.print(" (");
    Serial.print(pirValue == HIGH ? "Motion" : "No Motion");
    Serial.print(") | Seat: ");
    Serial.println(occupied ? "OCCUPIED" : "EMPTY");
  }
}

void sendDataOverWiFi(int fsr, int delta, int pir, bool occupied) {
  HTTPClient http;
  String url = String(serverAddress) + String(endpoint);
  
  Serial.print("Connecting to: ");
  Serial.println(url);
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  String jsonString = "{";
  jsonString += "\"fsr\":" + String(fsr) + ",";
  jsonString += "\"delta\":" + String(delta) + ",";
  jsonString += "\"pir\":" + String(pir) + ",";
  jsonString += "\"seat\":\"" + String(occupied ? "OCCUPIED" : "EMPTY") + "\"";
  jsonString += "}";
  
  Serial.print("Sending JSON: ");
  Serial.println(jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    Serial.print("Response: ");
    Serial.println(response);
  } else {
    Serial.print("Error on sending POST: ");
    Serial.println(httpResponseCode);
    
    // Additional error information
    if (httpResponseCode == -1) {
      Serial.println("Connection failed. Possible causes:");
      Serial.println("1. Server is not running or not accessible");
      Serial.println("2. Incorrect IP address or port");
      Serial.println("3. Network connectivity issues");
      Serial.println("4. Server is not accepting connections");
    }
  }
  
  http.end();
}