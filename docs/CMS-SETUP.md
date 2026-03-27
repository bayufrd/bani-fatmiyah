# CMS Admin Setup

## Akses Admin Dashboard

1. **Buka di browser:** `http://localhost:3001/admin`
2. **Password default:** lihat di `.env` file (`ADMIN_PASSWORD`)

---

## Cara Menggunakan

### 1. Login
- Masukkan password dari `.env` (`ADMIN_PASSWORD`)
- Klik tombol "Login"

### 2. Tambah Member Baru
- Isi form dengan data keluarga
- Klik tombol "Tambah"
- Data akan tersimpan otomatis di SQLite database

### 3. Edit Member
- Klik tombol "Edit" pada member yang ingin diubah
- Update data di form
- Klik "Update"

### 4. Hapus Member
- Klik tombol "Delete" pada member
- Konfirmasi penghapusan
- Data akan dihapus dari database

### 5. Cari Member
- Gunakan search box untuk mencari berdasarkan nama
- Klik tombol "Search"

---

## Database Location

- **File database:** `data/family.db`
- **Type:** SQLite 3
- **Size:** Sangat kecil (~100KB per 1000 records)

---

## Mengubah Password Admin

Edit file `.env`:
```
ADMIN_PASSWORD="password-baru-anda"
```

Restart server agar perubahan berlaku.

---

## Export/Backup Database

Backup database sangat mudah - cukup copy file `data/family.db` ke lokasi aman.

Untuk backup otomatis, Anda bisa gunakan task scheduler atau cron job.

---

## API Endpoints

Jika ingin integrate dengan aplikasi lain:

### GET - Ambil semua members
```bash
curl http://localhost:3001/api/members
```

### GET - Cari member
```bash
curl "http://localhost:3001/api/members?search=nama"
```

### POST - Tambah member (butuh password)
```bash
curl -X POST http://localhost:3001/api/members \
  -H "Content-Type: application/json" \
  -H "x-admin-password: admin123" \
  -d '{"name":"Nama","generation":1,"gender":"male"}'
```

### PUT - Update member (butuh password)
```bash
curl -X PUT "http://localhost:3001/api/members?id=member-id" \
  -H "Content-Type: application/json" \
  -H "x-admin-password: admin123" \
  -d '{"name":"Nama Baru"}'
```

### DELETE - Hapus member (butuh password)
```bash
curl -X DELETE "http://localhost:3001/api/members?id=member-id" \
  -H "x-admin-password: admin123"
```

---

## Keuntungan Setup Ini

✅ **Ringan** - Tanpa port tambahan, database file kecil  
✅ **Simple** - Hanya password, tanpa login kompleks  
✅ **Fast** - Direct SQLite queries, no ORM overhead  
✅ **Portable** - Hanya 1 file database, mudah backup  
✅ **Secure enough** - Password protected API  

---

## Troubleshooting

### Database tidak terbuat?
```powershell
# Jalankan seeder manual
npx ts-node scripts/seed.ts
```

### Password salah?
- Cek di file `.env`
- Restart server setelah ubah password

### Port sudah dipakai?
- Next.js otomatis ganti ke port lain (cek console)
- Atau kill process yang pakai port: `netstat -ano | findstr :3000`
