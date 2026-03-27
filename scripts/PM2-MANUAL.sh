#!/bin/bash

# PURE MANUAL PM2 START
# Copy-paste commands dari sini

# ============================================
# SETUP & BUILD
# ============================================

# 1. Go ke folder app
cd /path/to/dt-banifatmiyah

# 2. Build app
npm run build

# 3. Kill process lama jika ada
pm2 delete silsilah

# ============================================
# START WITH PM2 - PILIH SALAH SATU
# ============================================

# Option A: Simple - Start dengan npm start
pm2 start npm --name "silsilah" -- start -- -p 3006

# Option B: Direct - Start Next.js server
pm2 start .next/standalone/server.js --name "silsilah" -- -p 3006

# Option C: Using script
pm2 start "npm start -- -p 3006" --name "silsilah"

# ============================================
# SAVE CONFIG
# ============================================

pm2 save

# ============================================
# VERIFY
# ============================================

pm2 status
pm2 logs silsilah

# ============================================
# USEFUL COMMANDS
# ============================================

# View real-time logs
pm2 logs silsilah --follow

# View last 50 lines
pm2 logs silsilah --lines 50

# Monitor CPU & Memory
pm2 monit

# Restart app
pm2 restart silsilah

# Stop app
pm2 stop silsilah

# Delete app dari PM2
pm2 delete silsilah

# View all PM2 info
pm2 info silsilah

# Auto-start on reboot
pm2 startup
pm2 save

# Remove auto-start
pm2 unstartup
