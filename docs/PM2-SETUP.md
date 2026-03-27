# PM2 Setup Guide untuk Silsilah Keluarga

## Persiapan

### 1. Install Node.js & npm (jika belum)
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# Verifikasi
node --version
npm --version
```

### 2. Install PM2 Globally
```bash
npm install -g pm2

# Verifikasi
pm2 --version
```

### 3. Install PM2 Startup Hook (untuk auto-start saat reboot)
```bash
pm2 startup
# Ikuti instruksi yang diberikan
pm2 save
```

---

## Cara Menjalankan App dengan PM2

### Metode 1: Menggunakan Script (Recommended)

```bash
# Buat script executable
chmod +x start.sh

# Jalankan dengan port default (3000)
./start.sh

# Jalankan dengan port custom
./start.sh 8080
```

### Metode 2: Manual Command (Tanpa Script)

```bash
# Build application
npm run build

# Start dengan PM2 di port 3000
pm2 start npm --name "silsilah" -- start -- -p 3000

# Save konfigurasi
pm2 save
```

### Metode 3: Menggunakan Custom Script (Lebih Detail)

```bash
# Buat file dengan nano
nano silsilah-start.sh

# Paste konten di bawah, kemudian Ctrl+X, Y, Enter
#!/bin/bash
PORT=${1:-3000}
npm run build
pm2 start npm --name "silsilah" -- start -- -p $PORT
pm2 save
echo "✅ App started on port $PORT"

# Jalankan
chmod +x silsilah-start.sh
./silsilah-start.sh 3000
```

---

## Mengecek Port yang Tersedia

### Metode 1: Menggunakan Script yang Sudah Disediakan

```bash
# Buat script executable
chmod +x check-port.sh

# Check port tertentu
./check-port.sh check 3000

# Cari port yang tersedia (range 3000-3100)
./check-port.sh find

# Cari port custom range
./check-port.sh find 5000 5100

# List semua port yang digunakan
./check-port.sh list

# List port yang sering digunakan
./check-port.sh busy
```

### Metode 2: Manual Command (Tanpa Script)

```bash
# Check apakah port 3000 tersedia
sudo netstat -tuln | grep 3000

# Atau gunakan ss (lebih baru)
ss -tuln | grep 3000

# List semua port yang listening
sudo netstat -tuln | grep LISTEN

# Atau dengan ss
ss -tuln | grep LISTEN

# Cek port spesifik dengan lsof
sudo lsof -i :3000
```

### Metode 3: Menggunakan nc (netcat)

```bash
# Test connection ke port
nc -zv localhost 3000

# Output:
# - "succeeded" = port tersedia
# - "refused" = port tidak tersedia
```

---

## PM2 Commands Penting

```bash
# Status semua proses
pm2 status
pm2 ls

# Lihat logs
pm2 logs silsilah
pm2 logs silsilah --lines 50  # Last 50 lines
pm2 logs silsilah --follow     # Real-time logs

# Monitor resources
pm2 monit

# Restart app
pm2 restart silsilah

# Stop app
pm2 stop silsilah

# Delete app dari PM2
pm2 delete silsilah

# Restart semua PM2 apps
pm2 restart all

# Stop semua PM2 apps
pm2 stop all

# Start semua PM2 apps
pm2 start all

# Save config
pm2 save

# Show PM2 info
pm2 info silsilah
```

---

## Contoh Skenario Lengkap

### Skenario: Production Setup di Linux

```bash
# 1. Masuk ke direktori app
cd /path/to/dt-banifatmiyah

# 2. Install dependencies
npm install

# 3. Check port tersedia
./check-port.sh find 3000 3100

# 4. Start app di port 3000 (asumsi tersedia)
./start.sh 3000

# 5. Verify status
pm2 status

# 6. Auto-start saat server reboot
pm2 startup
pm2 save

# 7. Setup reverse proxy (Nginx/Apache) untuk domain
# (Konfigurasi reverse proxy pointing ke localhost:3000)

# 8. Monitor
pm2 logs silsilah
pm2 monit
```

### Skenario: Multiple Instances

```bash
# Start instance 1 di port 3000
pm2 start npm --name "silsilah-1" -- start -- -p 3000

# Start instance 2 di port 3001
pm2 start npm --name "silsilah-2" -- start -- -p 3001

# Start instance 3 di port 3002
pm2 start npm --name "silsilah-3" -- start -- -p 3002

# Save
pm2 save

# Setup load balancer (Nginx) untuk mendistribusikan traffic
```

---

## Troubleshooting

### Port sudah digunakan
```bash
# Cari proses yang menggunakan port 3000
sudo lsof -i :3000

# Kill proses
sudo kill -9 <PID>

# Atau gunakan fuser
sudo fuser -k 3000/tcp
```

### PM2 crash atau tidak start
```bash
# Delete old PM2 config
pm2 delete all
pm2 flush

# Start fresh
./start.sh 3000
```

### Check PM2 logs
```bash
# Full logs
pm2 logs silsilah

# Error logs only
pm2 logs silsilah --err

# Specific lines
tail -f ~/.pm2/logs/silsilah-error.log
tail -f ~/.pm2/logs/silsilah-out.log
```

### Reset PM2
```bash
# Remove all processes
pm2 delete all

# Remove PM2 daemon
pm2 kill

# Remove startup hook
pm2 unstartup
```

---

## Tips & Best Practices

1. **Selalu gunakan PM2 save** setelah membuat changes
   ```bash
   pm2 save
   ```

2. **Monitor secara berkala**
   ```bash
   pm2 monit
   ```

3. **Setup error logging**
   ```bash
   pm2 start npm --name "silsilah" -- start -- -p 3000 --error-log /var/log/silsilah-error.log
   ```

4. **Gunakan PM2 Plus untuk monitoring lebih baik**
   ```bash
   pm2 plus
   ```

5. **Backup PM2 config**
   ```bash
   cp ~/.pm2/dump.pm2 ~/.pm2/dump.pm2.backup
   ```

6. **Set memory limit** (prevent memory leak)
   ```bash
   pm2 start npm --name "silsilah" --max-memory-restart 500M -- start -- -p 3000
   ```

---

## Integrasi dengan Domain (fathmiyah.dastrevas.com)

Setelah PM2 running di port 3000, setup reverse proxy:

### Nginx Configuration
```nginx
upstream silsilah {
    server localhost:3000;
}

server {
    listen 80;
    server_name fathmiyah.dastrevas.com;

    location / {
        proxy_pass http://silsilah;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Apache Configuration
```apache
<VirtualHost *:80>
    ServerName fathmiyah.dastrevas.com
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

---

## SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d fathmiyah.dastrevas.com

# Auto-renewal sudah otomatis
sudo systemctl enable certbot.timer
```

---

## Questions?

Untuk bantuan lebih lanjut, lihat:
- PM2 Docs: https://pm2.keymetrics.io/docs/usage/quick-start/
- Next.js Production: https://nextjs.org/docs/deployment/best-practices
