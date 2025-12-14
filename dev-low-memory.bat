@echo off
REM Coffee PuLa - Low Memory Development Mode (CMD/Batch)
REM Usage: dev-low-memory.bat

echo.
echo ====================================
echo Coffee PuLa - Low Memory Dev Mode
echo ====================================
echo.

REM Check if Docker Desktop is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Desktop is not running!
    echo.
    echo Please:
    echo 1. Open Docker Desktop from Start Menu
    echo 2. Wait until Docker icon turns green
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

REM Set environment variables
set NODE_OPTIONS=--max-old-space-size=512
set NEXT_TELEMETRY_DISABLED=1
set LOW_MEMORY=true

echo Memory Settings:
echo   Node.js: 512MB max
echo   MySQL: 150MB (optimized)
echo   Go Backend: ~30-50MB
echo   Total Expected: ~700MB
echo.

REM Start MySQL
echo Starting MySQL...
docker-compose up -d mysql
if errorlevel 1 (
    echo [ERROR] Failed to start MySQL
    pause
    exit /b 1
)
echo [OK] MySQL started
timeout /t 3 /nobreak >nul
echo.

REM Start Go Backend in new window
echo Starting Go Backend...
start "Coffee PuLa Backend" cmd /k "cd backend && set LOW_MEMORY=true && go run main.go"
timeout /t 2 /nobreak >nul
echo [OK] Backend starting in new window
echo.

REM Start Next.js Frontend
echo Starting Next.js Frontend...
echo.
echo Access Points:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8081
echo   Database: http://localhost:8080 (phpMyAdmin)
echo.
echo Press Ctrl+C to stop
echo.

npm run dev:low-memory
