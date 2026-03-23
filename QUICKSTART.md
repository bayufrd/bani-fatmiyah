# Quick Start Guide

Panduan cepat untuk memulai menggunakan aplikasi Silsilah Keluarga Farmiyah.

## 🚀 Start dalam 5 Menit

### 1. Setup
```bash
cd d:\project-repo\dt-banifatmiyah
npm install
npm run dev
```

### 2. Buka Browser
Navigasi ke `http://localhost:3000`

### 3. Explore
- **Beranda**: Lihat overview aplikasi
- **Pohon Silsilah**: Jelajahi 6 generasi keluarga
- **Cari**: Temukan anggota keluarga dengan cepat

---

## 📖 Panduan Penggunaan

### Menggunakan Pohon Silsilah

1. Klik **Pohon Silsilah** di navigasi
2. Lihat anggota keluarga per generasi
3. Klik tombol generasi untuk expand/collapse
4. Klik kartu anggota untuk melihat detail
5. Lihat informasi lengkap di panel detail

### Menggunakan Pencarian

1. Klik **Cari** di navigasi
2. Ketik nama anggota (Indonesia atau Arab)
3. Lihat hasil secara real-time
4. Klik hasil untuk melihat detail
5. Lihat hubungan keluarga di panel kanan

### Melihat Detail Anggota

Detail anggota mencakup:
- ✓ Nama lengkap
- ✓ Nama Arab
- ✓ Jenis kelamin
- ✓ Tanggal lahir/meninggal
- ✓ Generasi
- ✓ Deskripsi peran
- ✓ Orang tua
- ✓ Daftar anak

---

## 📁 Struktur Folder

```
src/
├── app/
│   ├── layout.tsx          # Layout root
│   └── page.tsx            # Halaman utama (home, tree, search)
│
├── components/
│   ├── FamilyNode.tsx      # Komponen kartu anggota
│   ├── FamilyTree.tsx      # Komponen pohon silsilah
│   └── FamilySearch.tsx    # Komponen pencarian
│
├── data/
│   └── familyData.ts       # Data anggota keluarga
│
└── styles/
    └── globals.css         # CSS global Tailwind
```

---

## 🎨 Customization

### Menambah Anggota Keluarga

Edit `src/data/familyData.ts`:

```typescript
{
  id: 'farmiyah-6-4',                    // ID unik
  name: 'Nama Lengkap',                   // Nama Indonesia
  arabicName: 'الاسم بالعربية',           // Nama Arab
  birth: '1995',                          // Tahun lahir
  death: '2024',                          // Tahun meninggal (opsional)
  gender: 'male',                         // male atau female
  parentId: 'farmiyah-5-1',              // ID orang tua
  description: 'Deskripsi singkat',      // Keterangan peran
  generation: 6,                          // Nomor generasi
}
```

### Mengubah Warna

Edit `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: '#1a1a1a',      // Warna utama
      accent: '#8b5cf6',       // Warna aksen (ungu)
      // Tambah warna custom...
    },
  },
},
```

### Mengubah Font

Edit `globals.css` untuk mengubah font family.

---

## 🔧 Development Tips

### Mode Development
```bash
npm run dev                 # Jalankan dev server dengan hot reload
npm run dev -- -p 3001    # Gunakan port berbeda
```

### Production Build
```bash
npm run build              # Build optimized
npm start                  # Jalankan production server
```

### Code Quality
```bash
npm run lint               # Check dengan ESLint
```

### Debugging

1. Buka Chrome DevTools (F12)
2. Go to React DevTools
3. Inspect components
4. Check state dan props
5. Use console untuk logging

---

## 📊 Data Statistics

Aplikasi saat ini memiliki:

| Kategori | Jumlah |
|----------|--------|
| Total Anggota | 21 |
| Generasi | 6 |
| Laki-laki | 11 |
| Perempuan | 10 |
| Dengan nama Arab | 21 |
| Dengan tanggal lahir | 21 |
| Dengan tanggal meninggal | 11 |

---

## 🎯 Common Tasks

### Hapus Filter Pencarian
Kosongkan input search field

### Lihat Semua Anggota
Klik tab Pohon Silsilah

### Melihat Hubungan Keluarga
Klik anggota, lihat panel detail di sebelah kanan

### Export Data
Gunakan Console browser:
```javascript
console.table(familyData)
```

---

## ❓ FAQ

**Q: Bagaimana menambah anggota keluarga?**
A: Edit file `src/data/familyData.ts` dan tambah object baru ke array.

**Q: Bisakah mengubah warna aplikasi?**
A: Ya, edit `tailwind.config.ts` untuk mengubah tema warna.

**Q: Bagaimana cara print halaman?**
A: Gunakan Ctrl+P (Windows) atau Cmd+P (Mac).

**Q: Bisa akses dari mobile?**
A: Ya, aplikasi fully responsive untuk semua ukuran layar.

**Q: Bagaimana cara deploy ke production?**
A: Build dengan `npm run build` lalu push ke hosting platform (Vercel, Netlify, etc).

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
- [Lucide Icons](https://lucide.dev)

---

## 💡 Tips

✅ Gunakan Firefox DevTools untuk inspect komponen React lebih mudah
✅ Simpan bookmark ke aplikasi untuk akses cepat
✅ Gunakan fitur pencarian untuk menemukan anggota dengan cepat
✅ Reguler update data untuk memastikan akurasi

---

Selamat menggunakan aplikasi Silsilah Keluarga Farmiyah! 🎉
