#!/bin/bash

# Script untuk menjalankan Silsilah Keluarga dengan PM2
# Port default: 3000 (bisa di-override dengan argumen)

PORT=${1:-3000}

echo "================================"
echo "Starting Silsilah Keluarga App"
echo "Port: $PORT"
echo "================================"

# Check apakah PM2 sudah terinstall
if ! command -v pm2 &> /dev/null; then
    echo "PM2 tidak ditemukan. Install dengan: npm install -g pm2"
    exit 1
fi

# Build Next.js application
echo "Building application..."
npm run build

# Start dengan PM2
echo "Starting with PM2..."
pm2 start npm --name "silsilah" -- start -- -p $PORT

# Save PM2 configuration
echo "Saving PM2 configuration..."
pm2 save

echo "================================"
echo "✅ App berhasil dijalankan!"
echo "URL: http://localhost:$PORT"
echo "================================"
echo ""
echo "Useful PM2 Commands:"
echo "  pm2 status              - Lihat status semua proses"
echo "  pm2 logs silsilah       - Lihat logs app"
echo "  pm2 stop silsilah       - Stop app"
echo "  pm2 restart silsilah    - Restart app"
echo "  pm2 delete silsilah     - Hapus app dari PM2"
echo "  pm2 monit               - Monitor CPU dan memory"
echo ""
