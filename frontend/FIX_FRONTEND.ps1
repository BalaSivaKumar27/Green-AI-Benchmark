# Green AI Benchmark - Frontend Fix Script
# Run this script from PowerShell to fix all frontend issues

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Green AI Benchmark - Frontend Fix" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean everything
Write-Host "[1/5] Cleaning old dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules
    Write-Host "  [OK] Removed node_modules" -ForegroundColor Green
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force package-lock.json
    Write-Host "  [OK] Removed package-lock.json" -ForegroundColor Green
}

# Step 2: Install ajv first
Write-Host "[2/5] Installing ajv@^8..." -ForegroundColor Yellow
npm install ajv@^8.12.0 --legacy-peer-deps --silent
Write-Host "  [OK] ajv installed" -ForegroundColor Green

# Step 3: Install all dependencies
Write-Host "[3/5] Installing all dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps
Write-Host "  [OK] Dependencies installed" -ForegroundColor Green

# Step 4: Start server
Write-Host "[4/5] Starting frontend server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Frontend should now be starting..." -ForegroundColor Cyan
Write-Host "Wait for 'Compiled successfully!' message" -ForegroundColor Cyan
Write-Host "Then open: http://localhost:3000" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Start npm
Write-Host "[5/5] Running npm start..." -ForegroundColor Yellow
npm start

