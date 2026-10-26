# Analisis ravenville.web.id

> Catatan versi: laporan ini merekam analisis dan scope versi awal. Versi 1.1 kini menambahkan OAuth Discord dan profil tim lewat Vercel Functions. Lihat `discord-setup.md` dan README untuk fitur terkini.

Diperiksa pada 26 Oktober 2026 melalui browser Chromium desktop dan halaman publik. Sumber: https://ravenville.web.id/. Ini audit permukaan publik, bukan audit source code, keamanan menyeluruh, database, atau area admin.

## Struktur dan tujuan

Situs adalah pusat informasi komunitas Discord Indonesia. Jalur utamanya: pengunjung mengenali komunitas, melihat aktivitas/tim, lalu mengikuti undangan Discord. Navigasi menghubungkan beranda, Server Stats, Team, Portfolio, Twibbon, Form, Webhook, dan menu tambahan. Terdapat pemilih EN/ID serta tautan media sosial di footer.

## Visual

Latar hitam/abu-abu, ilustrasi burung gagak dan arsitektur gothic, judul besar, navigasi mengambang dengan transparansi, serta tekstur grain membentuk identitas gelap yang cukup kuat. Font yang dimuat mencakup Outfit, Inter, Noto Sans, JetBrains Mono, dan Satoshi. CTA Discord menjadi aksi utama.

## Fitur yang dapat diverifikasi

| Bagian | Hasil pengamatan |
| --- | --- |
| Beranda | Identitas komunitas, deskripsi yang berganti, indikator online, dan tautan undangan |
| Statistik | Total anggota, bot, manusia, online, dan voice; awalnya belum terisi, kemudian berhasil dimuat |
| Team | Pengelompokan peran, pencarian, filter online, pengurutan, dan tombol profil |
| Portfolio | Poster event, tanggal, jumlah partisipasi, penjelasan dan penanda kolaborasi |
| `/twibbon` | Meminta login Discord sebelum menambahkan foto; alur setelah login tidak diperiksa |
| `/forms/public` | Daftar form; feedback terbuka dan beberapa form lain berstatus tidak tersedia |
| `/webhooks/editor` | Meminta login Discord sebelum dashboard; fungsi setelah login tidak diperiksa |
| Teknologi | Asset `/_next/` menunjukkan Next.js; header respons menyebut Vercel; koneksi Discord dan layanan lain tercantum di kebijakan sumber halaman |

Keberadaan domain dalam Content Security Policy tidak membuktikan bagaimana backend, database, atau autentikasi diimplementasikan. Fitur area privat tidak diasumsikan sudah diketahui.

## Peluang perbaikan

- Statistik dan tim bergantung pada pengambilan data. Loading pertama cukup lama pada sesi pemeriksaan, sehingga perlu timeout, penjelasan saat tidak tersedia, dan retry.
- Deskripsi beranda panjang dapat diringkas agar pesan utama dan CTA lebih cepat dipahami.
- Pengunjung perlu tahu apakah fitur memerlukan akun, apakah form sedang dibuka, dan apakah datanya benar-benar terkirim.
- Tampilan mobile harus menjaga navigasi ringkas, tombol mudah disentuh, pencarian mudah digunakan, dan kartu kegiatan tidak terlalu padat.
- Status kosong tidak boleh menyerupai angka nol. Angka publik, contoh, dan data aktual perlu dibedakan.

## Penerapan pada versi baru

Nocturne menggunakan identitas baru dengan tema gothic/monokrom dan gambar hero yang dibuat khusus. Tidak memakai nama tim, poster, teks panjang, atau identitas milik Ravenville sebagai konten komunitas baru. Struktur fitur publik dijadikan referensi, lalu diimplementasikan menggunakan React/TypeScript/Vite agar ringan dan mudah di-deploy ke Vercel.

Penyesuaian scope: statistik baru hanya memakai total/online dari endpoint undangan publik Discord; voice/bot tidak ditiru tanpa sumber data. Tim menggunakan profil statis yang bisa diedit. Twibbon tersedia lokal tanpa login. Form berupa draft lokal dan ekspor, bukan penerimaan pendaftaran di database. Webhook hanya editor preview/JSON. OAuth, admin, database, pengiriman webhook, dan log keamanan tidak termasuk versi statis ini.

Arah desain: website komunitas untuk pengunjung Discord Indonesia dengan estetika gothic fotografis. `DESIGN_VARIANCE: 6`, `MOTION_INTENSITY: 3`, `VISUAL_DENSITY: 4`. Native CSS dipakai untuk estetika khusus ini, dengan ikon Phosphor. Animasi masuk dipakai untuk hierarki hero; preferensi reduced motion menonaktifkannya.
