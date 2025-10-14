# SeatSmart Dashboard

A real-time dashboard for monitoring seat occupancy using FSR (Force Sensing Resistor) and PIR (Passive Infrared) sensors with an ESP32 microcontroller.

## Features

- Real-time seat occupancy detection
- Visual dashboard showing sensor data
- Live updates using WebSocket technology
- Responsive design that works on desktop and mobile devices

## Hardware Requirements

- ESP32 microcontroller
- FSR400 Force Sensing Resistor
- HC-SR501 PIR Motion Sensor
- LED indicator
- Resistors and wiring

## Wiring Diagram

```
ESP32     Components
=====     ==========
PIN 34  → FSR sensor
PIN 27  → PIR sensor
PIN 5   → LED (with appropriate resistor)
```

## Software Setup

1. **Install Node.js** (if not already installed):
   Download and install Node.js from [nodejs.org](https://nodejs.org/)

2. **Install dependencies**:
   Open a terminal in the project folder and run:
   ```
   npm install
   ```

3. **Connect your ESP32**:
   Connect your ESP32 to your computer via USB cable

4. **Upload Arduino code**:
   - Open `seat_sensor.ino` in the Arduino IDE
   - Select your ESP32 board and COM port
   - Upload the sketch to your ESP32

5. **Identify your Arduino's COM port**:
   Run the following command to list available COM ports:
   ```
   node list-ports.js
   ```
   
   Look for your Arduino/ESP32 in the list (usually shows manufacturer info).

6. **Run the server**:
   
   **On Windows (PowerShell)**:
   ```
   $env:SERIAL_PORT="COM3"; npm start
   ```
   (Replace COM3 with your actual COM port)
   
   **On Windows (Command Prompt)**:
   ```
   set SERIAL_PORT=COM3 && npm start
   ```
   (Replace COM3 with your actual COM port)
   
   **Using the batch file (Windows)**:
   ```
   start-dashboard.bat COM3
   ```
   (Replace COM3 with your actual COM port)
   
   **On Mac/Linux**:
   ```
   SERIAL_PORT=/dev/tty.usbserial-XXXX npm start
   ```
   (Replace with your actual port path)

7. **Open the dashboard**:
   Open your browser and navigate to `http://localhost:3001`

## Docker Setup

You can also run the SeatSmart dashboard using Docker:

1. **Install Docker**:
   Download and install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)

2. **Build and run with Docker Compose**:
   ```
   docker-compose up --build
   ```

3. **Configure serial port access**:
   The Docker container needs access to your Arduino's serial port. By default, it's configured to use `/dev/ttyUSB0`. 
   
   To specify a different port, modify the `SERIAL_PORT` environment variable in `docker-compose.yml`:
   ```yaml
   environment:
     - SERIAL_PORT=/dev/ttyUSB1  # Change to your actual port
   ```
   
   On Linux, you might need to run the container in privileged mode to access serial ports:
   ```yaml
   privileged: true
   ```
   
   On Windows/macOS, you may need to map the serial port differently:
   ```yaml
   devices:
     - "/dev/ttyUSB0:/dev/ttyUSB0"
   ```

4. **Access the dashboard**:
   Open your browser and navigate to `http://localhost:3001`

## How It Works

1. The ESP32 reads data from the FSR and PIR sensors
2. Sensor data is sent via serial communication to the computer
3. The Node.js server reads this serial data
4. The server processes the data and sends it to the web dashboard via WebSocket
5. The dashboard displays real-time sensor readings and seat occupancy status

## Customization

### Adjusting Sensitivity

In the Arduino code, you can adjust the sensitivity threshold:
```cpp
if (delta > 150) { // Adjust this value to change sensitivity
  seatOccupied = true;
} else {
  seatOccupied = false;
}
```

### Changing Update Interval

To change how frequently the sensors are read:
```cpp
const unsigned long interval = 300; // milliseconds
```

## Troubleshooting

1. **Dashboard shows "Connecting to server..."**:
   - Make sure the Node.js server is running
   - Check that the serial port is correctly configured
   - Verify that the Arduino is properly connected

2. **No sensor data**:
   - Verify that the ESP32 is properly connected
   - Check that the Arduino code was uploaded successfully
   - Ensure the correct COM port is specified
   - Check the serial monitor in Arduino IDE to verify data is being sent

3. **Incorrect sensor readings**:
   - During setup, keep the seat empty during FSR calibration
   - Check wiring connections
   - Adjust the sensitivity threshold in the Arduino code

4. **"Access denied" or "Permission denied" error**:
   - Make sure no other program (like Arduino IDE) is using the COM port
   - Try disconnecting and reconnecting the Arduino
   - Restart the server

5. **Docker issues**:
   - Make sure Docker Desktop is running
   - Check that your user has permissions to run Docker commands
   - On Linux, you might need to add your user to the docker group
   - For serial port access issues, try running the container in privileged mode

## License

MIT License