const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the public directory
app.use(express.static('public'));

// Replace with your actual serial port name
// On Windows it might be 'COM3', 'COM4', etc.
// On Mac/Linux it might be '/dev/tty.usbmodem14101' or similar
const SERIAL_PORT = process.env.SERIAL_PORT || 'COM3'; // Change this to match your Arduino's port
const PORT = process.env.PORT || 3001; // Changed to 3001 to avoid conflicts

let latestData = {
  fsr: 0,
  delta: 0,
  pir: 'No Motion',
  seat: 'EMPTY'
};

let serialPortInstance = null;

// List available ports
SerialPort.list().then(ports => {
  console.log('Available serial ports:');
  if (ports.length === 0) {
    console.log('No serial ports found. Please connect your Arduino and restart the server.');
  } else {
    ports.forEach(port => {
      console.log(`- ${port.path} (${port.manufacturer || 'Unknown device'})`);
    });
    console.log(`\nAttempting to connect to: ${SERIAL_PORT}`);
  }
}).catch(err => {
  console.error('Error listing serial ports:', err.message);
});

// Only try to connect to serial port if SERIAL_PORT is not set to "none"
if (SERIAL_PORT !== "none") {
  try {
    serialPortInstance = new SerialPort({
      path: SERIAL_PORT,
      baudRate: 115200,
    });

    const parser = serialPortInstance.pipe(new ReadlineParser({ delimiter: '\n' }));

    parser.on('data', (data) => {
      const cleanData = data.toString().trim();
      console.log('Raw serial data:', cleanData);
      
      // Skip empty lines
      if (!cleanData) return;
      
      // Parse the data from Arduino (serial)
      // Format: "FSR: 100 | Δ: 0 | PIR: 0 (No Motion) | Seat: EMPTY"
      const fsrMatch = cleanData.match(/FSR: (\d+)/);
      const deltaMatch = cleanData.match(/Δ: (\d+)/);
      const pirValueMatch = cleanData.match(/PIR: (\d+)/);
      const pirTextMatch = cleanData.match(/PIR: \d+ \(([\w\s]+)\)/);
      const seatMatch = cleanData.match(/Seat: (OCCUPIED|EMPTY)/);
      
      if (fsrMatch && deltaMatch && pirValueMatch && pirTextMatch && seatMatch) {
        latestData = {
          fsr: parseInt(fsrMatch[1]),
          delta: parseInt(deltaMatch[1]),
          pir: pirTextMatch[1].trim(),
          seat: seatMatch[1]
        };
        
        // Send data to all connected clients
        io.emit('sensorData', latestData);
        console.log('Parsed serial data:', latestData);
      } else {
        console.log('Could not parse serial data:', cleanData);
      }
    });

    serialPortInstance.on('error', (err) => {
      console.error('Serial port error:', err.message);
      console.log('Please check if the Arduino is connected and the correct port is specified.');
      console.log('Also ensure no other program (like Arduino IDE) is using the port.');
      console.log('You can specify the port by setting the SERIAL_PORT environment variable.');
      console.log('Example: SERIAL_PORT=COM4 npm start');
      console.log('To run without serial connection, set SERIAL_PORT=none');
    });

    serialPortInstance.on('open', () => {
      console.log(`Serial port ${SERIAL_PORT} opened successfully`);
    });
  } catch (err) {
    console.error('Error opening serial port:', err.message);
    console.log('Please check if the Arduino is connected and the correct port is specified.');
    console.log('Also ensure no other program (like Arduino IDE) is using the port.');
    console.log('You can specify the port by setting the SERIAL_PORT environment variable.');
    console.log('Example: SERIAL_PORT=COM4 npm start');
    console.log('To run without serial connection, set SERIAL_PORT=none');
  }
} else {
  console.log('Running in Docker mode without serial connection');
  console.log('Waiting for data from WiFi-connected devices');
}

// API endpoint to receive sensor data from ESP32 over WiFi
app.post('/api/sensor-data', (req, res) => {
  console.log('Received WiFi data:', req.body);
  
  // Validate incoming data
  if (req.body.hasOwnProperty('fsr') && 
      req.body.hasOwnProperty('delta') && 
      req.body.hasOwnProperty('pir') && 
      req.body.hasOwnProperty('seat')) {
    
    latestData = {
      fsr: req.body.fsr,
      delta: req.body.delta,
      pir: req.body.pir == 1 ? 'Motion' : 'No Motion', // Convert numeric PIR to text
      seat: req.body.seat
    };
    
    // Send data to all connected clients
    io.emit('sensorData', latestData);
    console.log('Updated data from WiFi:', latestData);
    
    res.status(200).json({ status: 'success' });
  } else {
    res.status(400).json({ status: 'error', message: 'Invalid data format' });
  }
});

// API endpoint to get latest data
app.get('/api/sensor-data', (req, res) => {
  res.json(latestData);
});

// Serve the dashboard
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Send latest data to newly connected client
  socket.emit('sensorData', latestData);
  
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (SERIAL_PORT === "none") {
    console.log('Running in Docker mode without serial connection');
    console.log('Waiting for data from WiFi-connected devices');
  } else {
    console.log(`Make sure your Arduino is connected to ${SERIAL_PORT}`);
    console.log('If you need to change the serial port, restart the server with:');
    console.log(`  SERIAL_PORT=COM4 npm start (on Mac/Linux)`);
    console.log(`  $env:SERIAL_PORT="COM4"; npm start (on Windows PowerShell)`);
    console.log('To run without serial connection (for Docker), set SERIAL_PORT=none');
  }
});