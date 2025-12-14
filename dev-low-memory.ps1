# PowerShell Script to Run Development Mode with Low Memory
# Usage: .\dev-low-memory.ps1

Write-Host "☕ Coffee PuLa - Low Memory Development Mode" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Set Node.js memory limit
$env:NODE_OPTIONS="--max-old-space-size=512"
$env:NEXT_TELEMETRY_DISABLED="1"

Write-Host "📊 Memory Settings:" -ForegroundColor Yellow
Write-Host "   Node.js: 512MB max" -ForegroundColor White
Write-Host "   MySQL: 150MB (optimized)" -ForegroundColor White
Write-Host "   Go Backend: ~30-50MB" -ForegroundColor White
Write-Host "   Total Expected: ~700MB" -ForegroundColor White
Write-Host ""

# Start MySQL if not running
Write-Host "🐬 Starting MySQL..." -ForegroundColor Yellow
docker-compose up -d mysql
Start-Sleep -Seconds 3

# Start Go Backend in background
Write-Host "🚀 Starting Go Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; go run main.go" -WindowStyle Normal

Start-Sleep -Seconds 2

# Start Next.js Frontend
Write-Host "⚛️  Starting Next.js (Low Memory Mode)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "🔧 Backend API: http://localhost:8081" -ForegroundColor Green
Write-Host "📊 phpMyAdmin: http://localhost:8080" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "   - Close unnecessary browser tabs" -ForegroundColor White
Write-Host "   - Use 'docker stats' to monitor containers" -ForegroundColor White
Write-Host "   - Press Ctrl+C to stop" -ForegroundColor White
Write-Host ""

npm run dev:low-memory
