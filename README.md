# Silsilah Keluarga Farmiyah

Aplikasi web genealogi interaktif untuk menjelajahi dan mendokumentasikan silsilah keluarga Farmiyah dengan tampilan modern dan minimalis.

## Fitur Utama

✨ **Pohon Silsilah Interaktif**
- Visualisasi lengkap 6 generasi keluarga
- Desain modern dengan antarmuka yang dapat diperluas
- Informasi detail setiap anggota keluarga

👥 **Profil Anggota Lengkap**
- Nama dalam bahasa Indonesia dan Arab
- Tanggal lahir dan meninggal
- Deskripsi peran dan posisi dalam keluarga
- Hubungan kekeluargaan (orang tua, anak)

🔍 **Fitur Pencarian**
- Pencarian cepat berdasarkan nama
- Pencarian nama Arab
- Pencarian deskripsi
- Filter hasil real-time

📊 **Statistik Keluarga**
- Total anggota keluarga
- Jumlah generasi
- Distribusi gender
- Visualisasi data

## Teknologi yang Digunakan

- **Next.js 14** - Framework React modern
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling modern dan responsif
- **Lucide React** - Icon library
- **React Hooks** - State management

## Struktur Proyek

```
src/
├── app/
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Halaman utama
├── components/
│   ├── FamilyNode.tsx  # Komponen node silsilah
│   ├── FamilyTree.tsx  # Komponen pohon silsilah
│   └── FamilySearch.tsx # Komponen pencarian
├── data/
│   └── familyData.ts   # Data genealogi
└── styles/
    └── globals.css     # Style global
```

## Data Genealogi

Data keluarga tersimpan dalam format terstruktur dengan informasi:
- ID unik untuk setiap anggota
- Nama lengkap dan nama Arab
- Gender (laki-laki/perempuan)
- Tanggal lahir dan meninggal
- ID orang tua (untuk hierarchy)
- Nomor generasi
- Deskripsi singkat

## Cara Menggunakan

### Instalasi

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev

# Buka browser ke http://localhost:3000
```

### Build untuk Production

```bash
npm run build
npm start
```

## Fitur Halaman

### 1. Beranda
- Hero section dengan deskripsi aplikasi
- Call-to-action buttons
- Feature cards
- Statistik keluarga
- Informasi tentang silsilah

### 2. Pohon Silsilah
- Tampilan hierarki per generasi
- Tombol expand/collapse untuk setiap generasi
- Kartu anggota keluarga
- Detail panel saat memilih anggota
- Hubungan keluarga ditampilkan

### 3. Pencarian
- Input pencarian dengan real-time filter
- Grid hasil yang responsif
- Detail panel komprehensif
- Informasi keluarga dekat (orang tua, anak)
- Counter hasil pencarian

## Desain UI/UX

- **Minimalis Modern**: Desain bersih dengan whitespace yang cukup
- **Color Scheme**: Gradient purple-blue dengan aksen warna gender
  - Biru untuk laki-laki
  - Pink untuk perempuan
- **Responsive**: Fully responsive untuk desktop, tablet, dan mobile
- **Accessibility**: Semantic HTML dan ARIA labels
- **Performance**: Optimized rendering dan lazy loading

## Kustomisasi

### Menambah Anggota Keluarga

Edit file `src/data/familyData.ts`:

```typescript
{
  id: 'farmiyah-X-X',
  name: 'Nama Lengkap',
  arabicName: 'الاسم بالعربية',
  birth: 'YYYY',
  death: 'YYYY', // optional
  gender: 'male' | 'female',
  parentId: 'parent-id', // optional
  description: 'Deskripsi singkat',
  generation: 1,
}
```

### Mengubah Warna dan Tema

Edit file `tailwind.config.ts` untuk mengubah color scheme.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

© 2024 Silsilah Keluarga Farmiyah. Semua hak dilindungi.

## Author

Dibuat dengan teknologi modern untuk melestarikan sejarah keluarga.
