# Pratinjau tautan Discord

Konfigurasi publik berada di `src/data/share.json`. Plugin Vite `scripts/share.mjs` memasukkan Open Graph, Twitter Card, dan JSON Component Embed langsung ke HTML saat build. Discord tidak perlu menjalankan JavaScript untuk membacanya. `SITE_URL` menentukan origin produksi; build Vercel Preview memakai `VERCEL_URL` agar aset dan tautannya mengarah ke deployment yang ditinjau.

Component Embed memakai satu Container, Section dengan thumbnail logo, Media Gallery dengan gambar beranda, Separator, teks, empat tombol tautan, dan footer. Tidak ada bot, webhook, pengiriman pesan, atau secret yang diperlukan. Pemeriksaan `npm run check` memvalidasi batas JSON 3000 byte, maksimal 40 komponen, dan tombol style 5 (link). Open Graph menjadi fallback ketika klien tidak menampilkan Component Embed.

Gambar statis `public/images/sylux-share-cover-v1.jpg` berukuran 1200 × 630. Gambar ini dibuat dari tampilan beranda tanpa jumlah online agar angka tidak membeku di kartu. Thumbnail ada di `sylux-share-icon-v1.png`. Jika identitas/gambar berubah, buat aset versi baru dan perbarui konfigurasi sebelum build.

Halaman `/preview-discord/` adalah simulasi untuk tinjauan visual, bukan hasil tangkapan dari klien Discord. Metadata diuji dari HTML hasil build dan asetnya diuji di browser. Deployment Preview yang dilindungi Vercel memerlukan akses dan belum membuktikan Discord dapat mengaksesnya. Uji kartu sesungguhnya menggunakan URL produksi publik setelah perubahan disetujui dan diterapkan. Discord menyimpan cache pratinjau sekitar 30 menit; gunakan query versi baru seperti `/?v=2` saat menguji pembaruan. Pengaturan pengguna/server Discord juga dapat menyembunyikan pratinjau tautan.

Dokumentasi resmi: https://docs.discord.com/developers/link-previews/component-embeds dan https://docs.discord.com/developers/link-previews/overview.
