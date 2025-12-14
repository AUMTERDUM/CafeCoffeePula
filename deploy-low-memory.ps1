# Deployment Script for Coffee POS System (Low Memory Setup)
# PowerShell version for Windows
# This script builds and deploys the system for 4GB RAM PC

Write-Host "☕ Coffee PuLa - Deployment Script for Low Memory Setup" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# Step 1: Build Next.js Static Export
Write-Host ""
Write-Host "📦 Step 1: Building Next.js Static Export..." -ForegroundColor Yellow
npm run build:static

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Copy static files to backend
Write-Host ""
Write-Host "📁 Step 2: Copying static files to backend/static..." -ForegroundColor Yellow
if (Test-Path "backend\static") {
    Remove-Item -Recurse -Force "backend\static"
}
New-Item -ItemType Directory -Force -Path "backend\static" | Out-Null
Copy-Item -Recurse -Force "out\*" "backend\static\"

Write-Host "✅ Static files copied successfully!" -ForegroundColor Green

# Step 3: Start MySQL with optimized config
Write-Host ""
Write-Host "🐬 Step 3: Starting MySQL with optimized configuration..." -ForegroundColor Yellow
docker-compose up -d mysql

Write-Host "⏳ Waiting for MySQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 4: Build Go Backend
Write-Host ""
Write-Host "🔨 Step 4: Building Go Backend..." -ForegroundColor Yellow
Set-Location backend
go build -o server.exe main.go

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Go build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✅ Go backend built successfully!" -ForegroundColor Green
Set-Location ..

# Step 5: Show network info
Write-Host ""
Write-Host "📡 Step 5: Network Information" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host "Local IP Addresses:"
Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet*","Wi-Fi*" | 
    Where-Object {$_.IPAddress -notlike "169.254.*"} | 
    Select-Object -ExpandProperty IPAddress

Write-Host ""
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start the Go backend server:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Cyan
Write-Host "   .\server.exe" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Access from PC1 (Server):" -ForegroundColor White
Write-Host "   http://localhost:8081" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Access from PC2 (Client):" -ForegroundColor White
Write-Host "   http://YOUR_PC1_IP:8081" -ForegroundColor Cyan
Write-Host "   (Replace YOUR_PC1_IP with one of the IPs shown above)" -ForegroundColor Gray
Write-Host ""
Write-Host "💾 Memory Usage Expected:" -ForegroundColor Yellow
Write-Host "   - MySQL: ~150MB" -ForegroundColor White
Write-Host "   - Go Backend: ~50MB" -ForegroundColor White
Write-Host "   - Total: ~200MB" -ForegroundColor White
Write-Host ""
Write-Host "🎉 System ready for 24/7 operation!" -ForegroundColor Green
