# Portofolio Mukhamad Badrus Sholeh

Website portofolio berisi karya desain grafis dan fotografi, skill, serta prestasi akademik dan lomba.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-Personal-lightgrey?style=flat-square)

## Fitur

- Kartu identitas di bagian hero yang bisa ditarik dan berayun
- Mode terang dan gelap, mengikuti pengaturan perangkat dan bisa diganti manual
- Navigasi yang menyesuaikan bagian halaman yang sedang dibuka
- Galeri karya dengan filter Desain Grafis dan Fotografi
- Skill dengan carousel yang bisa digeser dengan mouse, jari, atau tombol
- Prestasi dengan dokumentasi yang bisa dibuka dalam tampilan layar penuh
- Formulir kontak yang membuka aplikasi email
- Mendukung pengaturan "kurangi gerakan" di perangkat

## Teknologi

- React 18
- Vite 5
- CSS biasa dengan variabel CSS
- Font Bricolage Grotesque dan Instrument Sans dari Google Fonts

## Menjalankan di komputer lokal

Butuh [Node.js](https://nodejs.org) versi 18 atau lebih baru.

```bash
npm install
npm run dev
```

Buka `http://localhost:5173` di browser.

Untuk membuat versi produksi:

```bash
npm run build
npm run preview
```

Hasil build ada di folder `dist/`. Proyek ini perlu dijalankan lewat perintah di atas. Membuka `index.html` langsung di browser tidak akan menampilkan halaman dengan benar.

## Struktur folder

```
portofolio/
├── public/
│   ├── Foto/            foto profil, karya, dan dokumentasi
│   └── Logo/            logo software untuk bagian skill
├── src/
│   ├── App.jsx          isi seluruh halaman
│   ├── Lanyard.jsx      kartu identitas di hero
│   ├── main.jsx         titik masuk aplikasi
│   └── style.css        tampilan dan animasi
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

File di dalam `public/` diakses langsung dari root, jadi di kode ditulis `/Foto/nama-file.jpg`.

## Mengubah isi

- Nama, deskripsi, dan kontak ada di `src/App.jsx`.
- Karya, skill, dan prestasi ada di array `WORKS`, `SKILLS`, dan `ACH` pada file yang sama.
- Teks dan data kartu identitas ada di komponen `Lanyard` pada bagian `App.jsx`.
- Warna utama ada di bagian `:root` pada `src/style.css`. Variabel `--acc` mengatur warna aksen.

## Deploy

1. Push repo ke GitHub.
2. Buka [vercel.com](https://vercel.com), pilih **Add New → Project**, lalu impor repo tersebut.
3. Vercel akan mengenali proyek Vite secara otomatis. Klik **Deploy**.

## Kontak

- Email: sholehbadrus278@email.com
- Instagram: [@mukh.bad_rush](https://www.instagram.com/mukh.bad_rush)
- TikTok: [@mukh.bad_rush](https://www.tiktok.com/@mukh.bad_rush)


## Lisensi

Proyek ini dibuat untuk portofolio pribadi. Konten berupa foto, desain, dan teks tidak boleh digandakan atau dipakai secara komersial tanpa izin.
