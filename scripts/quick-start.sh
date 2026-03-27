#!/bin/bash

# Quick Start Script untuk PM2
# Gunakan: ./quick-start.sh [PORT]

set -e  # Exit jika ada error

PORT=${1:-3000}

echo "╔════════════════════════════════════════╗"
echo "║  Silsilah Keluarga - PM2 Quick Start   ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "📍 Port: $PORT"
echo ""

# Step 1: Check Node.js
echo "✓ Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js not found. Please install Node.js first."
    exit 1
fi
NODE_VERSION=$(node -v)
echo "  Node: $NODE_VERSION"

# Step 2: Check npm
echo "✓ Checking npm..."
NPM_VERSION=$(npm -v)
echo "  npm: $NPM_VERSION"

# Step 3: Check PM2
echo "✓ Checking PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "  PM2 not found. Installing..."
    npm install -g pm2
fi
PM2_VERSION=$(pm2 -v)
echo "  PM2: $PM2_VERSION"

# Step 4: Check port availability
echo "✓ Checking port $PORT availability..."
if ss -tuln 2>/dev/null | grep -q ":$PORT "; then
    echo "  ⚠ Port $PORT is already in use!"
    echo "  Please choose another port or stop the running service."
    exit 1
else
    echo "  Port $PORT is available ✓"
fi

# Step 5: Install dependencies
echo "✓ Installing dependencies..."
npm install

# Step 6: Build Next.js
echo "✓ Building Next.js application..."
npm run build

# Step 7: Start with PM2
echo "✓ Starting app with PM2..."
pm2 start npm --name "silsilah" -- start -- -p $PORT

# Step 8: Save PM2 config
echo "✓ Saving PM2 configuration..."
pm2 save

# Step 9: Display status
echo ""
echo "╔════════════════════════════════════════╗"
echo "║         ✅ SUCCESS! App Running         ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "🌐 URL: http://localhost:$PORT"
echo ""
echo "📋 Useful commands:"
echo "   pm2 status          - Check app status"
echo "   pm2 logs silsilah   - View logs"
echo "   pm2 stop silsilah   - Stop app"
echo "   pm2 restart silsilah- Restart app"
echo "   pm2 monit           - Monitor resources"
echo ""
echo "💾 To auto-start on reboot:"
echo "   pm2 startup"
echo "   pm2 save"
echo ""
