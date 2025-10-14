const { SerialPort } = require('serialport');

SerialPort.list().then(ports => {
  console.log('Available COM ports:');
  ports.forEach(port => {
    console.log(`- ${port.path} (${port.manufacturer || 'Unknown device'})`);
  });
}).catch(err => {
  console.error('Error listing ports:', err);
});