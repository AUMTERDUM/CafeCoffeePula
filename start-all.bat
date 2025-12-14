@echo off
REM Start Everything - Coffee PuLa Dev Mode
REM Run this after Docker Desktop is running

echo Starting all services...
echo.

REM Set memory limits
set NODE_OPTIONS=--max-old-space-size=512
set NEXT_TELEMETRY_DISABLED=1

REM Start MySQL
echo [1/3] Starting MySQL...
docker-compose up -d mysql
timeout /t 3 /nobreak >nul

REM Start Backend in new window
echo [2/3] Starting Backend (new window)...
start "Backend - Coffee PuLa" cmd /k "cd backend && set LOW_MEMORY=true && go run main.go"
timeout /t 2 /nobreak >nul

REM Start Frontend
echo [3/3] Starting Frontend...
echo.
echo =================================
echo Access Points:
echo =================================
echo Frontend:    http://localhost:3000
echo Backend API: http://localhost:8081
echo phpMyAdmin:  http://localhost:8080
echo.
echo Press Ctrl+C to stop Frontend
echo (Backend will continue in other window)
echo =================================
echo.

npm run dev:low-memory
