# Panduan Penggunaan: Export NP2 ke CSV

## 📥 Cara Mengunduh Data NP2 yang Sudah Di-assign

### Untuk Admin P3

1. **Buka Halaman Assignment Manual**
   - Klik menu "⊕ Assignment Manual" di sidebar

2. **Lihat Data NP2 yang Sudah Di-assign**
   - Scroll ke bawah hingga melihat section "✓ NP2 Sudah Diassign ke Kelompok"
   - Di sini akan terlihat semua NP2 yang sudah Anda assign ke Kelompok I atau Kelompok II

3. **Download File CSV**
   - Klik tombol "↓ Unduh CSV" 
   - File akan otomatis terdownload dengan nama: `NP2_Assigned_AllKelompok_[tanggal]_[waktu].csv`

4. **Kirim ke SPV**
   - Bagikan file CSV ke SPV masing-masing kelompok
   - SPV dapat menggunakan file ini untuk meng-assign ke tim mereka

---

### Untuk SPV Kelompok I atau II

1. **Buka Halaman Assignment Manual**
   - Klik menu "⊕ Assignment Manual" di sidebar

2. **Lihat Data NP2 untuk Kelompok Anda**
   - Scroll ke bawah hingga melihat section "✓ NP2 Sudah Diassign ke Kelompok"
   - Di sini hanya akan muncul NP2 yang sudah di-assign ke kelompok Anda

3. **Download File CSV Untuk Kelompok Anda**
   - Klik tombol "↓ Unduh CSV"
   - File akan otomatis terdownload dengan nama:
     - Jika Kelompok I: `NP2_Assigned_Kelompok_I_[tanggal]_[waktu].csv`
     - Jika Kelompok II: `NP2_Assigned_Kelompok_II_[tanggal]_[waktu].csv`

4. **Gunakan File CSV untuk Assignment ke Tim**
   - Opsi A (Manual): Gunakan data dari tabel untuk meng-assign NP2 ke tim secara manual
   - Opsi B (Import): Upload file CSV ke section "📋 Antrian NP2 Belum Diassign" jika ingin re-import data

---

## 🔍 Fitur Tambahan

### Search/Filter Data
- Gunakan search box di atas tabel untuk mencari berdasarkan:
  - **NP2**: Nomor NP2 (contoh: NP2001)
  - **Nama WP**: Nama Wajib Pajak (contoh: PT Jaya Abadi)
  - **NPWP**: NPWP pelanggan (contoh: 12.345.678.9-901)

### Informasi di Tabel
Tabel menampilkan kolom:
- **NP2**: Nomor NP2
- **Nama WP**: Nama Wajib Pajak
- **NPWP**: Nomor NPWP
- **Jenis**: Jenis pemeriksaan (Khusus/Rutin)
- **Tipe**: Tipe WP (Badan/OP)
- **Potensi**: Nilai potensi pemeriksaan
- **Kode**: Kode pemeriksaan
- **Skor**: Skor beban kerja
- **Kelompok**: Kelompok yang sudah di-assign (Kelompok I / II)

---

## 📋 Format File CSV

File yang diunduh adalah file CSV (Comma Separated Values) dengan format:
```
np2, npwp, nama, jenis pemeriksaan, kode pemeriksaan, tipe, potensi, skor, isProminent
```

### Contoh Isi File:
```csv
np2,npwp,nama,jenis pemeriksaan,kode pemeriksaan,tipe,potensi,skor,isProminent
NP2001,12.345.678.9-901,PT Jaya Abadi,Khusus,Rutin DSPP,WP Badan,50000000,85,false
NP2002,12.345.678.9-902,CV Maju Jaya,Rutin,Pemsus DSPP,WP Badan,75000000,90,true
```

### Cara Membuka di Excel/Spreadsheet:
1. Buka aplikasi Excel atau Google Sheets
2. File > Open atau Ctrl+O
3. Pilih file CSV yang sudah diunduh
4. Jika diminta, pilih delimiter `,` (comma)
5. Data akan terlihat rapi di spreadsheet

---

## 💡 Tips & Trik

1. **Backup Data**: Simpan file CSV di folder backup secara berkala
2. **Compare Data**: Unduh file dari waktu berbeda untuk membandingkan progress assignment
3. **Print/Share**: File CSV bisa di-print atau di-share via email ke team
4. **Re-use Data**: Jika ada perubahan, file CSV bisa di-import kembali ke aplikasi

---

## ❓ Troubleshooting

### File tidak terdownload?
- Pastikan popup blocker tidak menghalang download
- Cek folder "Downloads" di komputer
- Refresh halaman dan coba lagi

### Tidak melihat tombol "↓ Unduh CSV"?
- Login dengan akun yang benar (Admin atau SPV)
- Scroll ke bawah halaman hingga melihat section "NP2 Sudah Diassign"
- Refresh browser (Ctrl+F5)

### Tabel kosong / tidak ada data?
- Pastikan sudah ada NP2 yang di-assign ke kelompok
- Admin harus melakukan assign terlebih dahulu
- Cek apakah user login adalah Admin atau SPV yang tepat

---

## 📞 Bantuan Lebih Lanjut

Jika ada pertanyaan atau masalah, hubungi Admin IT atau lihat dokumentasi teknis di file `FITUR_EXPORT_NP2_CSV.md`
