# SeatSmart Dashboard - Quick Start Guide

## What You've Created

You've built a complete seat occupancy monitoring system that includes:

1. **Hardware Component**: An ESP32 microcontroller with FSR and PIR sensors
2. **Arduino Firmware**: Code that reads sensor data and sends it via serial communication
3. **Node.js Server**: A bridge between the Arduino and web dashboard
4. **Web Dashboard**: A real-time visualization of seat occupancy status

## How to Use Your Dashboard

### Step 1: Hardware Setup
1. Connect your FSR sensor to ESP32 pin 34
2. Connect your PIR sensor to ESP32 pin 27
3. Connect an LED (with resistor) to ESP32 pin 5
4. Connect your ESP32 to your computer via USB

### Step 2: Upload Arduino Code
1. Open `seat_sensor.ino` in Arduino IDE
2. Select your ESP32 board and COM port
3. Upload the code to your ESP32

### Step 3: Start the Dashboard Server
1. Open a terminal in the project folder
2. Run one of these commands based on your system:

**Windows PowerShell:**
```
$env:SERIAL_PORT="COM3"; npm start
```

**Windows Command Prompt:**
```
set SERIAL_PORT=COM3 && npm start
```

**Using the batch file (Windows):**
```
start-dashboard.bat COM3
```

**Mac/Linux:**
```
SERIAL_PORT=/dev/tty.usbserial-XXXX npm start
```

(Replace COM3 or /dev/tty.usbserial-XXXX with your actual port)

### Step 4: View the Dashboard
1. Open your web browser
2. Navigate to http://localhost:3000
3. You should see real-time updates of your sensor data

## Customization Options

### Adjusting Sensitivity
In `seat_sensor.ino`, find this line:
```cpp
if (delta > 150) {
```
- Lower values make the sensor more sensitive
- Higher values make the sensor less sensitive

### Changing Update Speed
In `seat_sensor.ino`, find this line:
```cpp
const unsigned long interval = 300;
```
- This is in milliseconds (300 = 0.3 seconds)
- Lower values update more frequently
- Higher values update less frequently

## Troubleshooting Tips

1. **If the dashboard shows "Connecting..."**:
   - Check that the server is running
   - Verify the correct COM port is specified
   - Make sure no other program is using the COM port

2. **If sensor values aren't changing**:
   - Check your wiring
   - Verify the Arduino code is running (check serial monitor)
   - Make sure the sensors are properly connected

3. **If the server won't start**:
   - Make sure Node.js is installed
   - Run `npm install` to install dependencies
   - Check that the COM port exists

## Files in This Project

- `seat_sensor.ino` - Arduino firmware for ESP32
- `server.js` - Node.js server that bridges Arduino and web dashboard
- `public/index.html` - Web dashboard interface
- `package.json` - Project dependencies and scripts
- `README.md` - Detailed documentation
- `start-dashboard.bat` - Windows batch file for easy startup
- `list-ports.js` - Utility to list available COM ports

## Next Steps

Consider enhancing your dashboard with these features:
- Data logging to a file or database
- Historical data visualization
- Email/SMS notifications when seat becomes available
- Multiple seat monitoring
- Integration with calendar systems