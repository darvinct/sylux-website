# Pratinjau animasi SYLUX

Cabang `preview/sylux-scroll-motion` disiapkan untuk dilihat pengelola sebelum dipasang ke domain utama. Produksi tetap di commit `88d027f` sampai ada persetujuan.

Referensi: https://discord.my.id/. Bagian publik memperlihatkan elemen hero melayang dan transisi kartu. Pratinjau SYLUX memakai pola gerak yang lebih ringan sambil mempertahankan identitas ungu/violet/biru:

- Judul, informasi, dan kartu muncul sekali saat memasuki layar, dengan gerak naik 28px dan jeda antarkartu maksimal 260ms.
- Cahaya latar hero bergerak perlahan saat hero keluar dari layar, memakai CSS scroll timeline jika browser mendukungnya.
- Garis gradasi tipis menunjukkan posisi baca; hover kartu di desktop naik 4px.
- Tidak ada pengambilalihan scroll atau dependency animasi tambahan. Konten tetap tampil bila JavaScript/IntersectionObserver tidak tersedia.
- Pengaturan `prefers-reduced-motion` dihormati, termasuk jika diubah saat halaman terbuka. Fokus keyboard tidak disembunyikan.

Logo resolusi tinggi dibuat dari logo baru yang diberikan pengelola melalui proses pembersihan gambar. Latar hitam disatukan dengan tampilan menggunakan screen blend dan luminance mask. Ekspor Twibbon sudah menyesuaikan sumber gambar baru. Bentuk akhir logo dan gerakan tetap perlu ditinjau pengelola pada pratinjau ini.

Environment Preview tidak memerlukan salinan bot token untuk menampilkan tim: ketika token tidak tersedia, server membaca endpoint tim produksi yang memang sudah publik. Jumlah online tetap berasal dari public invite Discord. Login preview memerlukan konfigurasi OAuth tersendiri jika ingin diuji; perubahan ini berfokus pada tampilan dan scroll.

Validasi: `npm run check`, `npm run build`, dan browser smoke termasuk observer pada konten yang dimuat/difilter, tampilan statis saat reduced-motion aktif, serta perubahan preferensi tersebut saat runtime.
