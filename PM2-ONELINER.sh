#!/bin/bash

# QUICKEST PM2 START - One Liner Version
# Gunakan ini jika mau cepat

# ============================================
# PATH SETUP (MODIFY SESUAI STRUKTUR ANDA)
# ============================================

export APP_PATH="/home/user/dt-banifatmiyah"  # Ubah sesuai path Anda
export PORT="3006"

# ============================================
# RUN COMMANDS (Copy-paste satu per satu)
# ============================================

# 1. Build
cd $APP_PATH && npm run build

# 2. Start PM2
pm2 start npm --name "silsilah" -- start -- -p $PORT

# 3. Save
pm2 save

# 4. Check status
pm2 status

# ============================================
# ALTERNATIVE: All in One (Run sekaligus)
# ============================================

cd /home/user/dt-banifatmiyah && npm run build && pm2 delete silsilah 2>/dev/null; pm2 start npm --name "silsilah" -- start -- -p 3006 && pm2 save && pm2 status

# ============================================
# Monitor
# ============================================

pm2 logs silsilah --follow
