#!/bin/bash
# Deployment Script for Coffee POS System (Low Memory Setup)
# This script builds and deploys the system for 4GB RAM PC

echo "☕ Coffee PuLa - Deployment Script for Low Memory Setup"
echo "========================================================"

# Step 1: Build Next.js Static Export
echo ""
echo "📦 Step 1: Building Next.js Static Export..."
npm run build:static

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Step 2: Copy static files to backend
echo ""
echo "📁 Step 2: Copying static files to backend/static..."
rm -rf backend/static
mkdir -p backend/static
cp -r out/* backend/static/

echo "✅ Static files copied successfully!"

# Step 3: Start MySQL with optimized config
echo ""
echo "🐬 Step 3: Starting MySQL with optimized configuration..."
docker-compose up -d mysql

echo "⏳ Waiting for MySQL to be ready..."
sleep 10

# Step 4: Build Go Backend
echo ""
echo "🔨 Step 4: Building Go Backend..."
cd backend
go build -o server main.go

if [ $? -ne 0 ]; then
    echo "❌ Go build failed!"
    exit 1
fi

echo "✅ Go backend built successfully!"

# Step 5: Show network info
echo ""
echo "📡 Step 5: Network Information"
echo "==============================="
echo "Local IP Address:"
hostname -I | awk '{print $1}'

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Start the Go backend server:"
echo "   cd backend && ./server"
echo ""
echo "2. Access from PC1 (Server):"
echo "   http://localhost:8081"
echo ""
echo "3. Access from PC2 (Client):"
echo "   http://YOUR_PC1_IP:8081"
echo "   (Replace YOUR_PC1_IP with the IP shown above)"
echo ""
echo "💾 Memory Usage Expected:"
echo "   - MySQL: ~150MB"
echo "   - Go Backend: ~50MB"
echo "   - Total: ~200MB"
echo ""
echo "🎉 System ready for 24/7 operation!"
