@echo off
REM Quick Development Start (Windows CMD)
REM This is the SIMPLEST way to start development

echo.
echo =================================
echo Coffee PuLa - Quick Dev Start
echo =================================
echo.

REM Check Docker
docker ps >nul 2>&1
if errorlevel 1 (
    color 0C
    echo [X] Docker Desktop is NOT running!
    echo.
    echo ACTION REQUIRED:
    echo 1. Press Windows key
    echo 2. Type "Docker Desktop"
    echo 3. Click to open
    echo 4. Wait for green icon
    echo 5. Run this file again
    echo.
    pause
    exit /b 1
)

color 0A
echo [+] Docker: OK
echo.

REM Start MySQL only
echo Starting MySQL database...
docker-compose up -d mysql
timeout /t 3 /nobreak >nul

echo.
echo [+] MySQL: Started
echo.
echo ================================
echo Next Steps:
echo ================================
echo.
echo Open 2 MORE command prompts and run:
echo.
echo   Terminal 2:  cd backend
echo                go run main.go
echo.
echo   Terminal 3:  npm run dev:low-memory
echo.
echo ================================
echo Or just run: start-all.bat
echo ================================
echo.
pause
