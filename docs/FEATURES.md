# Dokumentasi Fitur

## 1. Beranda (Home Page)

Halaman beranda menampilkan:

### Hero Section
- Judul besar "Silsilah Keluarga Farmiyah"
- Sub-heading dengan deskripsi singkat aplikasi
- Call-to-action buttons untuk akses fitur utama
- Gradient background yang menarik

### Feature Cards
Tiga kartu fitur utama:

1. **Pohon Silsilah Interaktif** 🌳
   - Visualisasi lengkap 6 generasi
   - Interface dapat diperluas
   - Informasi detail setiap anggota

2. **Profil Anggota Lengkap** 👥
   - Nama Indonesia dan Arab
   - Tanggal lahir/meninggal
   - Deskripsi peran keluarga

3. **Pencarian Cepat** 🔍
   - Cari berdasarkan nama
   - Filter real-time
   - Hasil instan

### Statistics Section
Menampilkan statistik keluarga:
- Total anggota keluarga: 21
- Jumlah generasi: 6
- Jumlah laki-laki: 11
- Jumlah perempuan: 10

### About Section
Informasi lengkap tentang silsilah dan cara menggunakannya.

---

## 2. Pohon Silsilah (Family Tree)

Fitur menampilkan pohon silsilah dalam format terstruktur:

### Fitur Utama

**Per-Generasi Display**
- Setiap generasi ditampilkan dalam section terpisah
- Header dengan nama generasi dan jumlah anggota
- Tombol expand/collapse untuk menyembunyikan/menampilkan anggota

**Family Node Cards**
- Kartu individual untuk setiap anggota
- Warna berbeda untuk laki-laki (biru) dan perempuan (pink)
- Informasi:
  - Nama lengkap
  - Nama Arab
  - Tanggal lahir dan meninggal
  - Deskripsi singkat
  - Icon gender

**Interactive Selection**
- Klik kartu untuk memilih anggota
- Tampilkan detail panel saat memilih
- Visual feedback untuk selected state

**Detail Panel**
Ketika memilih anggota, tampilkan:
- Nama lengkap
- Nama Arab
- Jenis kelamin
- Tanggal lahir
- Tanggal meninggal (jika ada)
- Nomor generasi
- Keterangan
- Nama orang tua (jika ada)

### Interactions
- Hover effects pada kartu
- Smooth animations
- Responsive grid layout

---

## 3. Pencarian (Family Search)

Fitur pencarian komprehensif dengan multiple filters:

### Search Bar
- Input pencarian dengan icon magnifying glass
- Placeholder text yang helpful
- Real-time filtering
- Clear button

### Search Filters
Pencarian dapat dilakukan berdasarkan:
- Nama lengkap (Indonesia)
- Nama Arab
- Deskripsi/keterangan

### Results Display
- Grid hasil pencarian yang responsif
- Menampilkan jumlah hasil ditemukan
- Card untuk setiap hasil
- Tidak ada hasil message jika tidak ditemukan

### Detail Panel
Menampilkan informasi detail dengan:
- Informasi personel lengkap
- Family relations:
  - Orang tua
  - Daftar anak (jika ada)
- Layout tiga kolom yang responsif

### User Interactions
- Klik hasil untuk melihat detail
- Visual feedback selected state
- Smooth transitions
- Copy-friendly layout

---

## 4. Navigasi

### Top Navigation Bar
**Fixed sticky navigation** dengan:
- Logo dan brand name
- Navigation buttons:
  - Beranda (Home icon)
  - Pohon Silsilah (Tree icon)
  - Cari (Search icon)
- Active state highlighting
- Responsive design (icons only on mobile)

### Mobile Responsive
- Hamburger menu indicator
- Compact layout
- Touch-friendly buttons

---

## 5. Footer

**Static footer** dengan:
- Copyright information
- Tagline tentang preserving family history
- Credit/author info
- Sticky bottom behavior

---

## Data Structure

### FamilyMember Interface

```typescript
interface FamilyMember {
  id: string;              // Unique identifier
  name: string;            // Full name in Indonesian
  arabicName?: string;     // Full name in Arabic
  birth?: string;          // Birth year/date
  death?: string;          // Death year/date (optional)
  gender: 'male' | 'female';  // Gender
  parentId?: string;       // Parent's ID (optional)
  spouseIds?: string[];    // Spouse IDs (future feature)
  description?: string;    // Brief description/role
  generation: number;      // Generation number (1-6)
}
```

### Sample Data
- 21 total family members
- 6 generations from founder (1700s) to present
- Realistic Arabic names and Indonesian translations
- Birth/death years for historical context
- Descriptive information for each member

---

## Styling & UI

### Color Scheme

**Primary Colors**
- Purple: #8b5cf6 (accent, CTAs)
- Blue: #3b82f6 (male, primary)
- Pink: #ec4899 (female, secondary)

**Neutral Colors**
- Gray-900: #111827 (text)
- Gray-600: #4b5563 (secondary text)
- Gray-200: #e5e7eb (borders)
- Gray-50: #f9fafb (backgrounds)

### Typography

- **Headings**: Bold, large, high contrast
- **Body**: Regular weight, readable
- **Small text**: Subtle, supporting info
- **Arabic text**: Special font styling

### Spacing & Layout

- **Padding**: 4px - 8px for small, 16px - 24px for large
- **Margin**: Consistent 12px - 16px between sections
- **Grid**: Responsive columns (1 → 2 → 3)
- **Gap**: 16px - 24px between items

### Interactive Elements

- **Buttons**: Gradient backgrounds, hover scale
- **Cards**: Subtle shadows, hover lift effect
- **Inputs**: Border highlight on focus
- **Links**: Underline on hover
- **Selection**: Highlighting with background color

---

## Accessibility Features

- Semantic HTML structure
- Color contrast compliance
- Keyboard navigation support
- ARIA labels where needed
- Focus indicators
- Responsive font sizes
- Reduced motion support

---

## Performance Considerations

- React.memo for component optimization
- useMemo for filtered results
- Lazy loading capability
- Minimal re-renders
- Efficient state management
- CSS animations with GPU acceleration

---

## Future Enhancements

- [ ] Print functionality
- [ ] Export to PDF
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Add/edit family members
- [ ] Photo gallery
- [ ] Timeline view
- [ ] Advanced filtering (by birth year, etc.)
- [ ] Relationship finder
- [ ] Database integration

