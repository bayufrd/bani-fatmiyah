# Deployment Guide

## Production Setup

### Prerequisites
- Node.js 18.17+ atau 20 LTS
- npm atau yarn
- Linux/Unix server direkomendasikan (untuk production)

### Steps

1. **Clone repository**
   ```bash
   git clone <repo-url>
   cd dt-banifatmiyah
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   `postinstall` akan otomatis menyalin `public/sql-wasm.wasm`.

3. **Create data directory** (CRITICAL)
   ```bash
   mkdir -p data
   chmod 755 data
   ```

4. **Build project**
   ```bash
   npm run build
   ```

5. **Seed database dengan data awal** (Optional - auto-seed on startup)
   ```bash
   curl -X GET http://localhost:3000/api/members/import
   ```
   Atau tunggu server auto-seed saat pertama kali startup.

6. **Start production server**
   ```bash
   npm start
   # atau gunakan PM2
   pm2 start npm --name "silsilah" -- start
   ```

### Configuration

#### Environment Variables (.env.local)
```env
ADMIN_PASSWORD=admin123
NODE_ENV=production
```

#### Important Directories
- `data/` - Database file akan disimpan di sini
- `public/sql-wasm.wasm` - Runtime `sql.js`
- `public/gallery/` - Upload gallery photos
- `.next/` - Build output

### Troubleshooting

#### Error: `GET /api/members 500`

**Kemungkinan penyebab:**

1. **Database file tidak ada**
   - Solution: Pastikan folder `data/` ada dan writable
   ```bash
   ls -la data/
   ```

2. **Permission issue**
   - Solution: Fix permissions
   ```bash
   chmod 755 data/
   chmod 644 data/family.sqlite
   ```

3. **Node version mismatch**
   - Solution: Gunakan Node 18.17+ atau 20 LTS
   ```bash
   node --version
   ```

#### Error build: `EISDIR: illegal operation on a directory, readlink ...node_modules\next\dist\pages\_app.js`

Error ini **bukan** disebabkan oleh `sql.js` jika:
- `npm install` sukses
- `postinstall` sukses
- `node_modules/next/dist/pages/_app.js` adalah file biasa

**Kemungkinan penyebab:**
1. Custom `webpack()` di `next.config.*`
2. Alias atau externals yang menyentuh `next/dist/*`
3. Import langsung ke internal Next (`next/dist/...`)
4. Versi Node tidak sesuai
5. Path Windows bermasalah (folder sinkronisasi/cloud/network drive)

**Checklist dasar:**
```bash
node --version
npm ls next webpack
```

**Windows PowerShell check:**
```powershell
Get-Item .\node_modules\next\dist\pages\_app.js | Format-List FullName,Attributes,Mode,PSIsContainer
Get-ChildItem -Recurse -File . | Select-String "next/dist"
Get-ChildItem -Recurse -File . | Select-String "webpack\(|resolve\.alias|externals"
```

**Tindakan yang disarankan di Windows:**
1. Gunakan **Node 20 LTS**
2. Pindahkan project ke path lokal pendek, misalnya:
   ```powershell
   D:\src\dt-banifatmiyah
   ```
3. Hindari build dari folder:
   - OneDrive
   - Google Drive
   - network share
   - folder dengan junction/symlink khusus
4. Hapus cache dan install ulang:
   ```powershell
   Remove-Item -Recurse -Force .next,node_modules,package-lock.json
   npm install
   npm run build
   ```
5. Jika ada `next.config.*`, nonaktifkan sementara bagian `webpack()` lalu build ulang

**Jika masih gagal, kirim file berikut untuk analisis lanjutan:**
- `package.json`
- `next.config.js` / `next.config.mjs`
- hasil:
  ```powershell
  node --version
  Get-ChildItem -Recurse -File . | Select-String "next/dist"
  Get-ChildItem -Recurse -File . | Select-String "webpack\(|resolve\.alias|externals"
  ```

### Server Logs

Untuk melihat error detail, check server logs:

**PM2:**
```bash
pm2 logs silsilah
pm2 logs silsilah --err
```

**Direct output:**
```bash
npm start > app.log 2>&1 &
tail -f app.log
```

### Database Persistence

Database file tersimpan di `data/family.sqlite`. Untuk backup:
```bash
cp data/family.sqlite data/family.sqlite.backup
```

Untuk restore:
```bash
cp data/family.sqlite.backup data/family.sqlite
pm2 restart silsilah
```

### Production Best Practices

1. **Use PM2 for process management**
   ```bash
   pm2 install pm2-logrotate
   pm2 start npm --name "silsilah" -- start
   pm2 save
   pm2 startup
   ```

2. **Setup reverse proxy (Nginx)**
   ```nginx
   server {
     listen 80;
     server_name fathmiyah.dastrevas.com;
     
     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

3. **Monitor disk space**
   - Database dan gallery bisa besar
   - Monitor folder `public/gallery/` dan `data/`

4. **Regular backups**
   - Backup `data/family.sqlite`
   - Backup `public/gallery/` folder
