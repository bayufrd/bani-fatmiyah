# Panduan Instalasi dan Setup

## Prerequisite

Sebelum memulai, pastikan Anda sudah menginstall:

- **Node.js** (versi 18.17 atau lebih baru)
  - Download: https://nodejs.org/
  - Verifikasi: `node --version` dan `npm --version`

- **Git** (optional, untuk version control)
  - Download: https://git-scm.com/

## Langkah-Langkah Instalasi

### 1. Navigasi ke Folder Proyek

```bash
cd d:\project-repo\dt-banifatmiyah
```

### 2. Install Dependencies

```bash
npm install
```

Atau jika menggunakan yarn:

```bash
yarn install
```

### 3. Jalankan Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

Buka browser dan kunjungi URL tersebut untuk melihat aplikasi berjalan.

### 4. Build untuk Production

```bash
npm run build
npm start
```

## Struktur File Penting

```
dt-banifatmiyah/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Layout root
│   │   └── page.tsx         # Halaman utama
│   ├── components/
│   │   ├── FamilyNode.tsx   # Komponen node
│   │   ├── FamilyTree.tsx   # Pohon silsilah
│   │   └── FamilySearch.tsx # Fitur pencarian
│   ├── data/
│   │   └── familyData.ts    # Data genealogi
│   └── styles/
│       └── globals.css      # CSS global
├── package.json             # Dependensi proyek
├── next.config.js           # Konfigurasi Next.js
├── tailwind.config.ts       # Konfigurasi Tailwind
├── tsconfig.json            # Konfigurasi TypeScript
└── README.md                # Dokumentasi
```

## Troubleshooting

### Port 3000 Sudah Digunakan

Jika port 3000 sudah digunakan:

```bash
npm run dev -- -p 3001
```

### Module Not Found Error

Jika mendapat error module tidak ditemukan:

```bash
# Hapus node_modules dan lock file
rm -rf node_modules package-lock.json

# Install ulang
npm install
```

### Error TypeScript

Jika ada error TypeScript saat development:

```bash
# Coba build
npm run build

# Jika error persisten, hapus .next folder
rm -rf .next

# Jalankan dev server lagi
npm run dev
```

## Pengembangan Lebih Lanjut

### Menambah Fitur Baru

1. **Buat komponen baru** di `src/components/`
2. **Import dan gunakan** di halaman atau komponen lain
3. **Update data** di `src/data/familyData.ts` jika diperlukan

### Mengubah Styling

Semua styling menggunakan Tailwind CSS. Edit:
- `src/styles/globals.css` untuk style global
- `tailwind.config.ts` untuk konfigurasi tema
- Class Tailwind langsung di komponen

### Menambah Halaman Baru

1. Buat folder di `src/app/[folder-name]/`
2. Buat file `page.tsx` di dalamnya
3. Export default component React

Contoh: `src/app/about/page.tsx`

## Tips dan Best Practices

✅ **Gunakan TypeScript** - Definisikan tipe data dengan jelas
✅ **Component Reusability** - Buat komponen yang dapat digunakan kembali
✅ **Performance** - Gunakan `useMemo` dan `useCallback` untuk optimasi
✅ **Responsive Design** - Test di berbagai ukuran layar
✅ **Code Format** - Konsisten dengan ESLint rules

## Perintah Useful

```bash
# Development
npm run dev          # Jalankan dev server

# Production
npm run build        # Build proyek
npm start           # Jalankan production server

# Quality
npm run lint        # Check code dengan ESLint
```

## Resources Tambahan

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Lucide Icons](https://lucide.dev)

## Support

Jika mengalami masalah, silakan:

1. Cek dokumentasi di README.md
2. Lihat file `.eslintrc.json` untuk aturan code
3. Baca komentar di dalam file source code
4. Cek console browser untuk error messages

Happy coding! 🚀
