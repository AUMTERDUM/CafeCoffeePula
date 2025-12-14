#!/bin/bash
# Bash Script to Run Development Mode with Low Memory
# Usage: ./dev-low-memory.sh

echo "☕ Coffee PuLa - Low Memory Development Mode"
echo "============================================="
echo ""

# Set Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=512"
export NEXT_TELEMETRY_DISABLED="1"

echo "📊 Memory Settings:"
echo "   Node.js: 512MB max"
echo "   MySQL: 150MB (optimized)"
echo "   Go Backend: ~30-50MB"
echo "   Total Expected: ~700MB"
echo ""

# Start MySQL if not running
echo "🐬 Starting MySQL..."
docker-compose up -d mysql
sleep 3

# Start Go Backend in background
echo "🚀 Starting Go Backend..."
cd backend
go run main.go &
BACKEND_PID=$!
cd ..

sleep 2

# Start Next.js Frontend
echo "⚛️  Starting Next.js (Low Memory Mode)..."
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8081"
echo "📊 phpMyAdmin: http://localhost:8080"
echo ""
echo "💡 Tips:"
echo "   - Close unnecessary browser tabs"
echo "   - Use 'docker stats' to monitor containers"
echo "   - Press Ctrl+C to stop"
echo ""

# Trap to kill backend on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT

npm run dev:low-memory
