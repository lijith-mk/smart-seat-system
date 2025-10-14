@echo off
setlocal

echo SeatSmart Dashboard Starter
echo ===========================

if "%1"=="" (
    echo Usage: start-dashboard.bat ^<COM_PORT^>
    echo Example: start-dashboard.bat COM3
    echo.
    echo Available COM ports:
    node list-ports.js
    echo.
    echo Please specify your Arduino's COM port and try again.
    pause
    exit /b
)

echo Starting dashboard with COM port: %1
echo.
set SERIAL_PORT=%1
node server.js