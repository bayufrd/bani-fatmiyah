#!/bin/bash

# PM2 Manual Start - Direct to App Folder
# Usage: ./pm2-start.sh [PORT]

PORT=${1:-3006}
APP_DIR=$(pwd)

echo "================================"
echo "PM2 Manual Start"
echo "================================"
echo ""
echo "📍 App Directory: $APP_DIR"
echo "📍 Port: $PORT"
echo ""

# Check port
echo "Checking port $PORT..."
if ss -tuln 2>/dev/null | grep -q ":$PORT "; then
    echo "✗ Port $PORT already in use!"
    exit 1
fi
echo "✓ Port $PORT available"
echo ""

# Kill existing PM2 instance jika ada
echo "Clearing old PM2 instances..."
pm2 delete silsilah 2>/dev/null || true

# Build
echo "Building application..."
npm run build

echo ""
echo "Starting with PM2..."
# Start dengan PM2 - direct ke folder
cd "$APP_DIR"
pm2 start "npm start -- -p $PORT" --name silsilah --cwd "$APP_DIR"

# Save
pm2 save

echo ""
echo "================================"
echo "✅ App Started!"
echo "================================"
echo ""
echo "📋 Check status:"
echo "   pm2 status"
echo ""
echo "📋 View logs:"
echo "   pm2 logs silsilah"
echo ""
echo "📋 Stop app:"
echo "   pm2 stop silsilah"
echo ""
echo "📋 Restart app:"
echo "   pm2 restart silsilah"
echo ""
echo "📋 Delete app:"
echo "   pm2 delete silsilah"
echo ""
