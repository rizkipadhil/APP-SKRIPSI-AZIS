const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware untuk parsing JSON
app.use(express.json());

// Menyajikan file statis dari folder public
app.use(express.static(path.join(__dirname, "public")));

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
  // Mencari nilai maksimum dan minimum untuk tiap kriteria
  const maxMin = {};
  
  criteria.forEach(criterion => {
    const criterionField = mapCriteriaToField(criterion.name);
    
    if (criterionField) {
      if (criterion.type === 'benefit') {
        maxMin[criterionField] = {
          max: Math.max(...students.map(s => s[criterionField])),
          min: Math.min(...students.map(s => s[criterionField]))
        };
      } else { // cost
        maxMin[criterionField] = {
          max: Math.max(...students.map(s => s[criterionField])),
          min: Math.min(...students.map(s => s[criterionField]))
        };
      }
    }
  });
  
  // Normalisasi dan kalkulasi nilai SAW untuk setiap siswa
  const hasilSAW = students.map(student => {
    let totalNilai = 0;
    
    criteria.forEach(criterion => {
      const criterionField = mapCriteriaToField(criterion.name);
      
      if (criterionField) {
        let normalisasi;
        
        if (criterion.type === 'benefit') {
          // Untuk benefit, nilai dinormalisasi dengan rumus: nilai / nilai maksimum
          normalisasi = student[criterionField] / maxMin[criterionField].max;
        } else { // cost
          // Untuk cost, nilai dinormalisasi dengan rumus: nilai minimum / nilai
          normalisasi = maxMin[criterionField].min / student[criterionField];
        }
        
        // Tambahkan nilai normalisasi dikalikan dengan bobot kriteria
        totalNilai += normalisasi * criterion.weight;
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
    'Nilai Rata-Rata Rapot': 'nilai',
    'Penghasilan Orang Tua': 'penghasilan',
    'Jumlah Saudara': 'jumlah_saudara',
    'Anak ke': 'anak_ke',
    'Prestasi Non Akademik': 'prestasi'
  };
  
  return mapping[criteriaName] || null;
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
