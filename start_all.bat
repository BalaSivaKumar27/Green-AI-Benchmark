@echo off
echo ============================================
echo Green AI Benchmark - Starting Application
echo ============================================
echo.

REM Check if MongoDB is running
net start | findstr /C:"MongoDB" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] MongoDB is running
) else (
    echo [WARNING] MongoDB may not be running
    echo Please start MongoDB before continuing
)

echo.
echo Checking setup...
echo.

REM Check if backend/.env exists
if not exist "backend\.env" (
    echo [ERROR] backend\.env not found!
    echo Please run: python setup.py
    pause
    exit /b 1
)
echo [OK] Backend .env exists

REM Check if frontend/.env exists
if not exist "frontend\.env" (
    echo [ERROR] frontend\.env not found!
    echo Please run: python setup.py
    pause
    exit /b 1
)
echo [OK] Frontend .env exists

REM Check if frontend node_modules exists
if not exist "frontend\node_modules" (
    echo [ERROR] Frontend dependencies not installed!
    echo Please run: cd frontend ^&^& npm install --legacy-peer-deps
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed

echo.
echo Starting servers...
echo.

REM Start Backend
echo [1/2] Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0backend && python server.py"

REM Wait a bit for backend to start
timeout /t 5 /nobreak >nul

REM Start Frontend
echo [2/2] Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ============================================
echo Both servers are starting in new windows...
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
echo DO NOT CLOSE THIS WINDOW
echo ============================================
echo.
pause

