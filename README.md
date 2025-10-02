# Aplikasi Beasiswa SAW (Simple Additive Weighting)

Aplikasi web untuk seleksi penerima beasiswa menggunakan metode Simple Additive Weighting (SAW) untuk SMA N 2 Kutai Kartanegara.

## Fitur

### Halaman Utama (Public)
- **Pengumuman Beasiswa**: Menampilkan hasil seleksi dengan peringkat siswa
- **Informasi Kuota**: Menampilkan kuota beasiswa dan total pendaftar
- **Kriteria dan Bobot**: Menampilkan detail kriteria penilaian dengan skala penilaian
- **Informasi Penelitian**: Menampilkan detail skripsi dan metode penelitian
- **Responsive Design**: Tampilan yang responsif untuk desktop dan mobile

### Admin Panel
- **Dashboard**: Statistik lengkap dengan chart visualisasi
- **Manajemen Data Siswa**: CRUD data siswa dengan struktur C1-C5
- **Manajemen Kriteria**: CRUD kriteria dengan skala penilaian detail
- **Informasi Sekolah**: Kelola informasi sekolah dan detail penelitian
- **Pengaturan**: Kelola kuota beasiswa dan pesan peringatan
- **Hasil Seleksi**: Tampilan hasil perhitungan SAW dengan peringkat

## Struktur Data

### Data Siswa (students.json)
```json
{
  "nisn": "75168490",
  "nama": "Fransiska Natali Cahayani Babut",
  "c1": 88,  // Nilai Rata-Rata Rapot
  "c2": 2000000,  // Penghasilan Orang Tua (dalam rupiah)
  "c3": 5,  // Jumlah Saudara
  "c4": 4,  // Anak ke
  "c5": "Tingkat Kabupaten"  // Prestasi
}
```

### Data Kriteria (criteria.json)
```json
{
  "kode": "C1",
  "nama": "Nilai Rata-Rata Rapot",
  "bobot": 0.35,
  "atribut": "benefit",
  "skala_penilaian": [
    {
      "rentang": "≥ 88",
      "nilai": 5
    }
  ]
}
```

### Data Informasi (informasi.json)
```json
{
  "nama_sekolah": "SMA N 2 Kutai Kartanegara",
  "alamat_sekolah": "Jl. Raya Kutai Kartanegara...",
  "tahun_ajaran": "2024/2025",
  "pembuat_skripsi": "Dedi Setiawan",
  "judul_skripsi": "Penerimaan Beasiswa SMAN 2 Kutai Kartanegara Menggunakan Metode Simple Additive Weighting",
  "tentang_skripsi": "Deskripsi skripsi...",
  "logo_sekolah": "/default-logo.png"
}
```

## Teknologi yang Digunakan

- **Backend**: Node.js + Express.js
- **Frontend**: Vue.js 3 + Tailwind CSS
- **Charts**: Chart.js
- **Icons**: Font Awesome
- **Data Storage**: JSON files

## Instalasi dan Menjalankan

1. Clone repository atau download aplikasi
2. Install dependencies:
   ```bash
   npm install
   ```

3. Jalankan server:
   ```bash
   node index.js
   ```

4. Buka browser dan akses:
   - Halaman utama: `http://localhost:3000`
   - Admin panel: `http://localhost:3000/admin.html`

## Login Admin

- **Username**: admin
- **Password**: admin123

## API Endpoints

### Public Endpoints
- `GET /api/students` - Dapatkan data siswa
- `GET /api/criteria` - Dapatkan data kriteria
- `GET /api/settings` - Dapatkan pengaturan
- `GET /api/informasi` - Dapatkan informasi sekolah
- `GET /api/hasil` - Dapatkan hasil seleksi SAW

### Admin Endpoints
- `POST /api/login` - Login admin
- `POST /api/students` - Tambah siswa baru
- `PUT /api/students/:nama` - Update data siswa
- `DELETE /api/students/:nama` - Hapus data siswa
- `PUT /api/criteria` - Update kriteria
- `PUT /api/settings` - Update pengaturan
- `PUT /api/informasi` - Update informasi sekolah

## Metode SAW (Simple Additive Weighting)

Aplikasi menggunakan metode SAW untuk menentukan peringkat siswa berdasarkan:

1. **Normalisasi**: Data dinormalisasi berdasarkan tipe kriteria (benefit/cost)
2. **Perhitungan**: Nilai SAW = Σ(normalisasi × bobot)
3. **Peringkat**: Siswa diurutkan berdasarkan nilai SAW tertinggi

### Kriteria Penilaian
- **C1 - Nilai Rata-Rata Rapot** (Benefit, Bobot: 0.35)
- **C2 - Penghasilan Orang Tua** (Cost, Bobot: 0.25)
- **C3 - Jumlah Saudara** (Benefit, Bobot: 0.20)
- **C4 - Anak Ke** (Cost, Bobot: 0.10)
- **C5 - Prestasi Akademik/Nonakademik** (Benefit, Bobot: 0.10)

## Struktur Folder

```
skripsi-azis/
├── data/                 # Data JSON
│   ├── students.json
│   ├── criteria.json
│   ├── settings.json
│   ├── informasi.json
│   └── users.json
├── public/              # File statis
│   ├── index.html       # Halaman utama
│   ├── admin.html       # Admin panel
│   └── default-logo.png # Logo default
├── storage/             # File upload
│   ├── .gitkeep
│   └── default-logo.png
├── index.js            # Server utama
├── package.json        # Dependencies
└── README.md          # Dokumentasi
```

## Kontribusi

Aplikasi ini dibuat sebagai bagian dari skripsi dengan judul "Penerimaan Beasiswa SMAN 2 Kutai Kartanegara Menggunakan Metode Simple Additive Weighting" oleh Dedi Setiawan.

## Lisensi

Aplikasi ini dibuat untuk tujuan akademik dan penelitian.
