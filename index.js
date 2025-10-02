const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 3000;

// Middleware untuk parsing JSON
app.use(express.json());

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'storage'));
  },
  filename: function (req, file, cb) {
    // Ganti nama file menjadi logo.png
    cb(null, 'logo.png');
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Hanya izinkan file gambar
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diizinkan!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // Batas 5MB
  }
});

// Menyajikan file statis dari folder public
app.use(express.static(path.join(__dirname, "public")));

// Menyajikan file dari folder storage
app.use('/storage', express.static(path.join(__dirname, 'storage')));

// Endpoint: Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const dataPath = path.join(__dirname, "data", "users.json");
  
  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Tidak dapat membaca data pengguna" });
    }
    
    const users = JSON.parse(data);
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      // Dalam aplikasi produksi, gunakan JWT atau session yang lebih aman
      res.json({ success: true, user: { username: user.username, role: user.role } });
    } else {
      res.status(401).json({ success: false, message: "Username atau password salah" });
    }
  });
});

// Endpoint: Dapatkan data siswa
app.get("/api/students", (req, res) => {
  const dataPath = path.join(__dirname, "data", "students.json");
  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Tidak dapat membaca data siswa" });
    }
    res.json(JSON.parse(data));
  });
});

// Endpoint: Dapatkan data kriteria dan bobot
app.get("/api/criteria", (req, res) => {
  const dataPath = path.join(__dirname, "data", "criteria.json");
  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Tidak dapat membaca data kriteria" });
    }
    res.json(JSON.parse(data));
  });
});

// Endpoint: Dapatkan data pengaturan
app.get("/api/settings", (req, res) => {
  const dataPath = path.join(__dirname, "data", "settings.json");
  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Tidak dapat membaca data pengaturan" });
    }
    res.json(JSON.parse(data));
  });
});

// Endpoint: Dapatkan informasi sekolah
app.get("/api/informasi", (req, res) => {
  const dataPath = path.join(__dirname, "data", "informasi.json");
  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Tidak dapat membaca data informasi sekolah" });
    }
    res.json(JSON.parse(data));
  });
});

// Endpoint: Memperbarui informasi sekolah
app.put("/api/informasi", (req, res) => {
  const updatedInfo = req.body;
  const dataPath = path.join(__dirname, "data", "informasi.json");
  
  fs.writeFile(dataPath, JSON.stringify(updatedInfo, null, 2), (err) => {
    if (err) {
      return res.status(500).json({ error: "Tidak dapat menyimpan data informasi sekolah" });
    }
    res.json({ message: "Data informasi sekolah berhasil diperbarui", informasi: updatedInfo });
  });
});

// Endpoint: Upload logo sekolah
app.post("/api/upload-logo", upload.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Tidak ada file yang diupload" });
    }

    // Hapus logo default jika ada
    const defaultLogoPath = path.join(__dirname, 'storage', 'default-logo.png');
    if (fs.existsSync(defaultLogoPath)) {
      fs.unlinkSync(defaultLogoPath);
    }

    // Update path logo di informasi.json
    const infoPath = path.join(__dirname, "data", "informasi.json");
    fs.readFile(infoPath, "utf8", (err, data) => {
      if (err) {
        return res.status(500).json({ error: "Tidak dapat membaca data informasi" });
      }
      
      const info = JSON.parse(data);
      info.logo_sekolah = '/storage/logo.png';
      
      fs.writeFile(infoPath, JSON.stringify(info, null, 2), (err) => {
        if (err) {
          return res.status(500).json({ error: "Tidak dapat menyimpan path logo" });
        }
        res.json({ 
          message: "Logo berhasil diupload", 
          logo_path: '/storage/logo.png' 
        });
      });
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: "Gagal mengupload logo" });
  }
});

// Endpoint: Hapus logo
app.delete("/api/delete-logo", (req, res) => {
  try {
    const logoPath = path.join(__dirname, 'storage', 'logo.png');
    
    if (fs.existsSync(logoPath)) {
      fs.unlinkSync(logoPath);
    }

    // Reset ke default logo
    const infoPath = path.join(__dirname, "data", "informasi.json");
    fs.readFile(infoPath, "utf8", (err, data) => {
      if (err) {
        return res.status(500).json({ error: "Tidak dapat membaca data informasi" });
      }
      
      const info = JSON.parse(data);
      info.logo_sekolah = '/default-logo.png';
      
      fs.writeFile(infoPath, JSON.stringify(info, null, 2), (err) => {
        if (err) {
          return res.status(500).json({ error: "Tidak dapat menyimpan path logo" });
        }
        res.json({ message: "Logo berhasil dihapus" });
      });
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: "Gagal menghapus logo" });
  }
});

// Endpoint: Memperbarui pengaturan
app.put("/api/settings", (req, res) => {
  const updatedSettings = req.body;
  const dataPath = path.join(__dirname, "data", "settings.json");
  
  fs.writeFile(dataPath, JSON.stringify(updatedSettings, null, 2), (err) => {
    if (err) {
      return res.status(500).json({ error: "Tidak dapat menyimpan data pengaturan" });
    }
    res.json({ message: "Data pengaturan berhasil diperbarui", settings: updatedSettings });
  });
});

// Endpoint: Hitung hasil SAW
app.get("/api/hasil", (req, res) => {
  // Membaca data siswa
  const studentsPath = path.join(__dirname, "data", "students.json");
  const criteriaPath = path.join(__dirname, "data", "criteria.json");
  const settingsPath = path.join(__dirname, "data", "settings.json");
  
  try {
    // Baca semua data yang diperlukan secara sinkron untuk memudahkan perhitungan
    const studentsData = JSON.parse(fs.readFileSync(studentsPath, "utf8"));
    const criteriaData = JSON.parse(fs.readFileSync(criteriaPath, "utf8"));
    const settingsData = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    
    // Siapkan output dan lakukan perhitungan SAW
    const hasilPerhitungan = hitungMetodeSAW(studentsData, criteriaData.criteria, settingsData);
    
    res.json(hasilPerhitungan);
  } catch (error) {
    console.error("Error dalam perhitungan SAW:", error);
    res.status(500).json({ error: "Gagal melakukan perhitungan hasil seleksi" });
  }
});

// Fungsi untuk menghitung metode SAW
function hitungMetodeSAW(students, criteria, settings) {
  // Konversi nilai mentah siswa ke nilai skala berdasarkan skala penilaian
  const studentsWithSkala = students.map(student => {
    const studentSkala = { ...student };
    
    criteria.forEach(criterion => {
      const criterionField = mapCriteriaToField(criterion.nama);
      
      if (criterionField) {
        // Konversi nilai mentah ke nilai skala menggunakan skala penilaian
        const nilaiSkala = convertToSkalaNilai(student[criterionField], criterion.skala_penilaian);
        studentSkala[`${criterionField}_skala`] = nilaiSkala;
      }
    });
    
    return studentSkala;
  });
  
  // Mencari nilai maksimum dan minimum untuk tiap kriteria (dari nilai skala)
  const maxMin = {};
  
  criteria.forEach(criterion => {
    const criterionField = mapCriteriaToField(criterion.nama);
    
    if (criterionField) {
      const values = studentsWithSkala.map(s => s[`${criterionField}_skala`]);
      
      maxMin[criterionField] = {
        max: Math.max(...values),
        min: Math.min(...values)
      };
    }
  });
  
  // Normalisasi dan kalkulasi nilai SAW untuk setiap siswa
  const hasilSAW = studentsWithSkala.map(student => {
    let totalNilai = 0;
    
    criteria.forEach(criterion => {
      const criterionField = mapCriteriaToField(criterion.nama);
      
      if (criterionField) {
        let normalisasi;
        const nilaiSkala = student[`${criterionField}_skala`];
        
        if (criterion.atribut === 'benefit') {
          // Untuk benefit, nilai dinormalisasi dengan rumus: nilai / nilai maksimum
          normalisasi = nilaiSkala / maxMin[criterionField].max;
        } else { // cost
          // Untuk cost, nilai dinormalisasi dengan rumus: nilai minimum / nilai
          normalisasi = maxMin[criterionField].min / nilaiSkala;
        }
        
        // Tambahkan nilai normalisasi dikalikan dengan bobot kriteria
        totalNilai += normalisasi * criterion.bobot;
      }
    });
    
    return {
      ...student,
      nilai_saw: parseFloat(totalNilai.toFixed(4))
    };
  });
  
  // Urutkan siswa berdasarkan nilai SAW (dari tertinggi ke terendah)
  hasilSAW.sort((a, b) => b.nilai_saw - a.nilai_saw);
  
  // Tandai siswa yang lolos
  const kuota = settings.kuota_beasiswa;
  
  return {
    hasil: hasilSAW.map((siswa, index) => ({
      ...siswa,
      peringkat: index + 1,
      lolos: index < kuota
    })),
    pengaturan: settings,
    kuota: kuota,
    jumlah_pendaftar: students.length
  };
}

// Fungsi untuk memetakan nama kriteria ke field di data siswa
function mapCriteriaToField(criteriaName) {
  const mapping = {
    'Nilai Rata-Rata Rapot': 'c1',
    'Penghasilan Orang Tua': 'c2',
    'Jumlah Saudara': 'c3',
    'Anak Ke': 'c4',
    'Prestasi Akademik/Nonakademik': 'c5'
  };
  
  return mapping[criteriaName] || null;
}

// Fungsi untuk menilai prestasi berdasarkan kategori
function getNilaiPrestasi(prestasi) {
  const mapping = {
    'Nasional': 5,
    'Provinsi': 4,
    'Kabupaten': 3,
    'Kelurahan': 2,
    'Tidak ada': 1,
    'Tidak Ada': 1
  };
  
  return mapping[prestasi] || 1;
}

// Fungsi untuk mengkonversi nilai mentah ke nilai skala berdasarkan skala penilaian
function convertToSkalaNilai(nilaiMentah, skalaPenilaian) {
  if (!skalaPenilaian || skalaPenilaian.length === 0) {
    return nilaiMentah; // Jika tidak ada skala penilaian, kembalikan nilai asli
  }

  // Untuk kriteria yang menggunakan kategori (seperti prestasi)
  if (typeof nilaiMentah === 'string') {
    const skala = skalaPenilaian.find(s => 
      s.kategori && s.kategori.toLowerCase() === nilaiMentah.toLowerCase()
    );
    return skala ? skala.nilai : 1;
  }

  // Untuk kriteria numerik (nilai, penghasilan, dll)
  const nilai = parseFloat(nilaiMentah);
  
  for (const skala of skalaPenilaian) {
    if (skala.rentang) {
      if (isInRange(nilai, skala.rentang)) {
        return skala.nilai;
      }
    }
  }
  
  // Jika tidak ada yang cocok, kembalikan nilai terendah
  return Math.min(...skalaPenilaian.map(s => s.nilai));
}

// Fungsi untuk mengecek apakah nilai berada dalam rentang
function isInRange(nilai, rentang) {
  if (rentang.includes('≥')) {
    const threshold = parseFloat(rentang.replace('≥', '').replace(/[^\d.-]/g, ''));
    return nilai >= threshold;
  } else if (rentang.includes('≤')) {
    const threshold = parseFloat(rentang.replace('≤', '').replace(/[^\d.-]/g, ''));
    return nilai <= threshold;
  } else if (rentang.includes(' - ')) {
    const parts = rentang.split(' - ');
    const min = parseFloat(parts[0].replace(/[^\d.-]/g, ''));
    const max = parseFloat(parts[1].replace(/[^\d.-]/g, ''));
    return nilai >= min && nilai <= max;
  }
  
  return false;
}

// Endpoint: Menambahkan data siswa baru
app.post("/api/students", (req, res) => {
  const newStudent = req.body;
  const dataPath = path.join(__dirname, "data", "students.json");
  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Tidak dapat membaca data siswa" });
    }
    let students = JSON.parse(data);
    students.push(newStudent);
    fs.writeFile(dataPath, JSON.stringify(students, null, 2), (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Tidak dapat menyimpan data siswa" });
      }
      res.json({ message: "Data siswa berhasil ditambahkan", students });
    });
  });
});

// Endpoint: Memperbarui data siswa
app.put("/api/students/:nama", (req, res) => {
  const { nama } = req.params;
  const updatedStudent = req.body;
  const dataPath = path.join(__dirname, "data", "students.json");
  
  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Tidak dapat membaca data siswa" });
    }
    
    let students = JSON.parse(data);
    const index = students.findIndex(student => student.nama === nama);
    
    if (index === -1) {
      return res.status(404).json({ error: "Siswa tidak ditemukan" });
    }
    
    students[index] = updatedStudent;
    
    fs.writeFile(dataPath, JSON.stringify(students, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Tidak dapat menyimpan data siswa" });
      }
      res.json({ message: "Data siswa berhasil diperbarui", student: updatedStudent });
    });
  });
});

// Endpoint: Menghapus data siswa
app.delete("/api/students/:nama", (req, res) => {
  const { nama } = req.params;
  const dataPath = path.join(__dirname, "data", "students.json");
  
  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Tidak dapat membaca data siswa" });
    }
    
    let students = JSON.parse(data);
    const filteredStudents = students.filter(student => student.nama !== nama);
    
    if (students.length === filteredStudents.length) {
      return res.status(404).json({ error: "Siswa tidak ditemukan" });
    }
    
    fs.writeFile(dataPath, JSON.stringify(filteredStudents, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Tidak dapat menyimpan data siswa" });
      }
      res.json({ message: "Data siswa berhasil dihapus" });
    });
  });
});

// Endpoint: Memperbarui kriteria
app.put("/api/criteria", (req, res) => {
  const updatedCriteria = req.body;
  const dataPath = path.join(__dirname, "data", "criteria.json");
  
  fs.writeFile(dataPath, JSON.stringify(updatedCriteria, null, 2), (err) => {
    if (err) {
      return res.status(500).json({ error: "Tidak dapat menyimpan data kriteria" });
    }
    res.json({ message: "Data kriteria berhasil diperbarui", criteria: updatedCriteria });
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
