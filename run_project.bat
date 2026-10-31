@echo off
echo ====================================================================
echo   PathForge: Starting Full-Stack Application
echo ====================================================================

:: 1. Ensure local MongoDB service is running for MongoDB Compass
net start MongoDB 2>nul

:: 2. Launch Backend API Server on Port 5000 (connected to mongodb://127.0.0.1:27017/pathforge)
start "PathForge Backend API (Port 5000)" cmd /k "node server/scripts/startDevServer.js"

:: 3. Launch Frontend React Vite Server on Port 5173
start "PathForge Frontend UI (Port 5173)" cmd /k "npm run dev --prefix client"

echo.
echo Initializing servers... Please wait 3 seconds...
timeout /t 3 >nul

:: 4. Open PathForge directly in the default browser
echo Opening PathForge in your browser...
start http://localhost:5173

echo.
echo ====================================================================
echo   PathForge is Live and Ready!
echo   * Web App:          http://localhost:5173
echo   * Backend API:      http://localhost:5000
echo   * MongoDB Compass:  mongodb://localhost:27017/pathforge
echo ====================================================================
