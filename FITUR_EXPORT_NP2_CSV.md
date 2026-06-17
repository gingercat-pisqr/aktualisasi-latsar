# FITUR EXPORT NP2 ASSIGNED KE CSV

## 📋 Ringkasan Implementasi

Fitur ini memungkinkan Admin P3 dan SPV Kelompok untuk mengunduh data NP2 Belum SP2 yang sudah di-assign ke kelompok dalam format CSV. SPV kemudian dapat menggunakan file CSV ini untuk meng-assign data tersebut ke tim mereka.

## 🎯 Alur Kerja

### Untuk Admin P3 (Administrator)
1. Admin membuka halaman "Assignment Manual"
2. Admin meng-assign NP2 ke Kelompok (K1 atau K2) melalui tombol "Assign"
3. Data yang sudah di-assign muncul di tabel "NP2 Sudah Diassign ke Kelompok"
4. Admin dapat mengklik tombol "↓ Unduh CSV" untuk mengunduh semua NP2 yang sudah di-assign
5. File CSV dapat diberikan kepada SPV Kelompok masing-masing

### Untuk SPV Kelompok
1. SPV membuka halaman "Assignment Manual"
2. SPV melihat tabel "NP2 Sudah Diassign ke Kelompok" - berisi hanya NP2 untuk kelompok mereka
3. SPV dapat mengklik tombol "↓ Unduh CSV" untuk mengunduh NP2 yang sudah di-assign ke kelompok mereka
4. SPV dapat meng-import file CSV ini atau langsung meng-assign ke Tim melalui UI
5. SPV meng-assign data NP2 ke Tim (Tim I-A, I-B, I-C untuk K1 atau Tim II-A, II-B, II-C untuk K2)

## 📁 File yang Dimodifikasi

### 1. **public/script.js** - Fungsi Export dan Display

#### Fungsi Baru:
```javascript
// Konversi data ke format CSV dengan proper escaping
convertToCSV(data, headers)

// Trigger browser untuk download file CSV
downloadCSV(csv, filename)

// Export data NP2 yang sudah di-assign ke kelompok
exportAssignedNP2ToCSV()

// Render tabel NP2 yang sudah di-assign
renderAssignedNP2Table()

// Filter tabel NP2 yang sudah di-assign
filterAssignedNP2()
```

#### Update Fungsi Existing:
- `showPage('assign')` - Tambah call `renderAssignedNP2Table()`
- `confirmAssign()` - Tambah call `renderAssignedNP2Table()` setelah assignment berhasil
- `switchUser()` - Tambah call `renderAssignedNP2Table()` untuk filter berdasarkan role user
- `init()` - Tambah call `renderAssignedNP2Table()`
- Event listener `DOMContentLoaded` - Tambah call `renderAssignedNP2Table()`

### 2. **index.html** - UI Changes

#### Halaman "Assignment Manual" (page-assign):
- Tambah tombol "↓ Unduh NP2 Assigned" di section-header
- Tambah section baru "✓ NP2 Sudah Diassign ke Kelompok" dengan:
  - Deskripsi: "Data yang sudah di-assign oleh Admin ke kelompok untuk selanjutnya di-assign ke tim"
  - Search filter untuk mencari NP2, Nama WP, atau NPWP
  - Tabel dengan kolom: NP2, Nama WP, NPWP, Jenis, Tipe, Potensi, Kode, Skor, Kelompok
  - Tombol "↓ Unduh CSV" untuk download data

## 📊 Format CSV yang Di-export

### Headers:
```
np2, npwp, nama, jenis pemeriksaan, kode pemeriksaan, tipe, potensi, skor, isProminent
```

### Contoh Data:
```csv
np2,npwp,nama,jenis pemeriksaan,kode pemeriksaan,tipe,potensi,skor,isProminent
NP2001,12.345.678.9-901,PT Jaya Abadi,Khusus,Rutin DSPP,WP Badan,50000000,85,false
NP2002,12.345.678.9-902,CV Maju Jaya,Rutin,Pemsus DSPP,WP Badan,75000000,90,true
```

## 🔐 Role-Based Access Control

### Admin P3
- ✅ Dapat melihat ALL NP2 yang sudah di-assign ke ANY kelompok (K1 atau K2)
- ✅ Dapat download semua data NP2 yang sudah di-assign
- ✅ Filename: `NP2_Assigned_AllKelompok_2026-06-17_120530.csv`

### SPV Kelompok
- ✅ Hanya dapat melihat NP2 yang di-assign ke kelompok mereka sendiri
- ✅ Hanya dapat download NP2 dari kelompok mereka
- ✅ Filename: 
  - SPV K1: `NP2_Assigned_Kelompok_I_2026-06-17_120530.csv`
  - SPV K2: `NP2_Assigned_Kelompok_II_2026-06-17_120530.csv`

## 🔄 Data Flow & Integration

1. **Admin Assignment**: Admin assign NP2 → set `kelompokId` pada item
2. **Display**: Tabel "NP2 Sudah Diassign" otomatis update via `renderAssignedNP2Table()`
3. **Export**: SPV download CSV → dapat digunakan untuk import atau manual assignment
4. **SPV Assignment**: SPV assign NP2 ke Tim → item dihapus dari `np2BelumSp2Data` dan ditambahkan ke `sp2BelumLhp`
5. **Activity Log**: Setiap export dicatat di activity log dengan icon 📥

## 📝 Activity Log Entry

Saat file CSV diekspor, berikut entry akan ditambahkan ke log:
```
Aksi: Export NP2
Icon: 📥
Detail: {count} data NP2 diekspor oleh {userName}
Waktu: {timestamp}
```

## ⚠️ Catatan Penting

1. **Data Validation**: Aplikasi memvalidasi bahwa SPV hanya bisa melihat data dari kelompok mereka
2. **CSV Escaping**: Fields yang mengandung comma, quotes, atau newline akan di-escape dengan benar
3. **Timestamp**: Filename include timestamp untuk membedakan file yang di-export di waktu berbeda
4. **Empty State**: Jika tidak ada data assigned, akan ditampilkan pesan "Tidak ada data NP2 yang sudah di-assign"

## 🧪 Testing

Telah dilakukan test dengan sample data:
- ✅ CSV conversion dengan proper escaping
- ✅ Filtering berdasarkan kelompokId
- ✅ Role-based filtering (Admin vs SPV)
- ✅ Filename generation dengan timestamp

## 🚀 Penggunaan

### Untuk Download:
1. Buka halaman "Assignment Manual"
2. Lihat tabel "NP2 Sudah Diassign ke Kelompok"
3. Klik tombol "↓ Unduh CSV"
4. File akan otomatis download dengan nama yang include timestamp

### Untuk Import Kembali:
SPV dapat menggunakan file CSV yang di-download untuk:
1. Manual assignment satu per satu via UI
2. Atau import ke aplikasi lain untuk processing lebih lanjut
3. File format kompatibel dengan format import existing (terlihat dari handleFileUpload)

## 📌 Future Enhancements (Optional)
- [ ] Add filter by date range untuk assignment
- [ ] Add export to Excel format (.xlsx)
- [ ] Add batch import from downloaded CSV
- [ ] Add email integration untuk send CSV ke SPV
