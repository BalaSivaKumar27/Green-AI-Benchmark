@echo off
title Fixing Frontend - Green AI Benchmark
color 0B

echo.
echo ============================================
echo   Fixing Frontend Dependencies
echo ============================================
echo.

cd /d "%~dp0"

echo [1] Removing old node_modules...
if exist node_modules (
    rd /s /q node_modules
    echo [OK] Removed node_modules
) else (
    echo [OK] No node_modules to remove
)

echo.
echo [2] Removing package-lock.json...
if exist package-lock.json (
    del package-lock.json
    echo [OK] Removed package-lock.json
) else (
    echo [OK] No package-lock.json to remove
)

echo.
echo [3] Installing ajv@8...
call npm install ajv@^8.12.0 --legacy-peer-deps
if errorlevel 1 (
    echo [ERROR] Failed to install ajv
    pause
    exit /b 1
)
echo [OK] ajv installed

echo.
echo [4] Installing all dependencies...
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed

echo.
echo ============================================
echo   Dependencies Fixed Successfully!
echo ============================================
echo.
echo Starting frontend server...
echo.

call npm start

pause

