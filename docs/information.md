# Halaman Informasi SYLUX

Route publik `/information` (juga `/information/`) tersedia dari navigasi utama dan footer. Nama halaman dan konten pendukung tersedia dalam Bahasa Indonesia/Inggris. Referensi struktur: https://discord.my.id/information/; teks dan peran disesuaikan untuk SYLUX.

Daftar role serta rentang level berasal dari pengelola SYLUX:

- **Sentinel Divisions:** Partner Staff, Event Creative Staff, Design & Editor Staff, Publication Staff, Media Staff, Game Staff, Female Staff, Streamer Staff, Medic Staff, Payment Staff.
- **Levelling:** Outsider 0–5, Resident+ 6–15, Data Knight 16–25, Circuit Breaker 26–40, Code Whisperer 41–60, Neon Architect 61–85, Quantum Shaper 86–110, The Glitched Crown 111–135.
- **Legacy recognition:** Cyber Veteran, ditampilkan terpisah tanpa rentang level.

Deskripsi disunting dan diterjemahkan dari fokus singkat yang diberikan pengelola. Tidak ada harga, benefit donasi, role contoh dari komunitas lain, atau janji pemberian role otomatis yang ditambahkan. Halaman ini tidak mengubah konfigurasi Discord dan tidak menetapkan divisi untuk tiga profil tim yang sudah ada.

Tampilan mengikuti struktur halaman referensi yang diperiksa pada 27 Oktober 2026: pembuka identitas besar di bidang ungu gelap, transisi menuju bidang gelap, daftar role/deskripsi di kiri, kartu ikon/judul yang tetap di kanan dan berubah mengikuti scroll, lalu deretan kartu role horizontal. Identitas, logo, warna aksen, serta isi seluruhnya memakai SYLUX. Tidak menyalin aset ilustrasi milik komunitas referensi.

Daftar divisi dan kartu detail tetap memakai struktur dua kolom di HP serta desktop. IntersectionObserver memilih artikel yang melewati tengah viewport. Klik/touch, tombol panah, Home, dan End bisa langsung menuju role. CSS sticky menjaga kartu tetap terlihat tanpa menangkap wheel atau touch. Kartu level dapat digeser, dioperasikan dengan keyboard, dan memakai tombol sebelumnya/berikutnya yang dinonaktifkan di ujung daftar.

Pembuka menggunakan CSS scroll timeline untuk memperbesar logo dan menggelapkan bidang saat pengguna melanjutkan scroll. Browser yang belum mendukung scroll timeline mendapat pembuka statis. Reduced-motion menonaktifkan zoom/transisi dan merapatkan daftar role sehingga tidak ada ruang scroll ekstra untuk animasi.

Navbar memakai daftar menu yang sama dan langsung terlihat di semua lebar: Beranda → Server Stats → Team → Portfolio → Informasi. Pada HP, menu berada di baris kedua; akun dan bahasa tetap di kanan baris pertama. Tidak ada hamburger atau drawer tersembunyi. Navbar tetap penuh dari kiri ke kanan dengan perilaku memudar saat scroll turun dan muncul saat scroll naik.

Papan palet Figma: https://www.figma.com/design/NvrkOMIR7TDzEDIHLds2ni?node-id=2-2

Palet latar mengikuti permintaan terbaru: gradasi ungu elektrik di kedua sisi, tanpa cahaya lavender terang atau bidang pembuka putih. Beranda dan pembuka Informasi memakai sumber CSS `--community-backdrop` yang sama. Panel Informasi memakai surface ungu gelap, dengan teks terang untuk keterbacaan.

Warna/gradient role mengikuti screenshot Discord yang dikirim pengelola. Warna gelap dicerahkan untuk keterbacaan web; seluruh stop warna yang dipakai diperiksa minimal 5:1 terhadap latar gelap pembanding `#392a3d`. Warna ini merupakan penyesuaian visual dari screenshot, bukan pembacaan HEX melalui API Discord.

Animasi memakai hook observer yang sama dengan beranda, menghormati reduced-motion, dan menjaga fokus keyboard tetap terlihat. Halaman di-load terpisah agar konten/piktogramnya tidak membebani beranda. Validasi browser mencakup route langsung dengan trailing slash, pergantian bahasa, pilihan peran, navigasi keyboard, carousel, rentang level, legacy, dan lebar 320/390/768/1024/1440px.

Pengelola meminta penerapan ke website utama. Perubahan diterbitkan melalui branch `main` ke produksi Vercel.
