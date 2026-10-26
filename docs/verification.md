# Hasil verifikasi versi Discord 1.1

Dijalankan pada 26 Oktober 2026 di Node.js 24.19.0 dan Chromium headless. Pengujian memakai respons Discord tiruan; credential atau akun Discord nyata milik pengguna belum tersedia.

## Backend

`npm run check` lulus, mencakup validasi undangan/filter/ekspor versi awal dan pengujian berikut:

- Konfigurasi menolak origin HTTP publik, subpath, secret terlalu pendek, dan Application ID tidak valid.
- OAuth login menghasilkan state acak, verifier, challenge PKCE S256, scope `identify`, redirect tetap, dan cookie HttpOnly/Secure/SameSite.
- Callback tanpa state/cookie yang cocok atau dengan issuer lain ditolak sebelum menukar code.
- Token exchange mengirim verifier dan redirect yang sesuai. Respons profil dipersempit ke field publik.
- Cookie sesi terenkripsi dapat dibaca server, ditolak setelah dimodifikasi, salah purpose, atau kedaluwarsa; cookie duplikat ditolak.
- Respons sesi dan cookie tidak menyertakan access token, refresh token, atau email Discord.
- Logout menolak origin lain serta GET, dan menghapus cookie untuk POST yang sah.
- Error provider menghasilkan pesan tetap tanpa merefleksikan detail sensitif.
- Pengambilan profil tim hanya dari ID terkonfigurasi, termasuk nickname/avatar guild. ID invalid/duplikat dan token bot kosong ditolak.
- Field privat user/guild tidak muncul dalam JSON publik; query pengunjung tidak dapat menambah target User ID.
- API lokal nyata melalui proxy Vite/preview: sesi tanpa credential mengembalikan status belum dikonfigurasi; daftar tiga User ID tanpa bot token mengembalikan JSON 503 yang ditangani UI, tanpa crash atau profil contoh.

## Frontend

`npm run build` dan browser smoke test pada production preview lulus:

- Login gate mencegah tampilan alat sebelum sesi ada; halaman akun menampilkan profil dari respons sesi.
- User yang login tidak otomatis ditambahkan ke direktori tim.
- Logout mengembalikan tampilan akun dan alat ke permintaan login.
- Layout tanpa horizontal overflow pada 320, 390, 768, 1024, dan 1440 px.
- Bahasa dan persistensi reload, menu mobile, pencarian/filter/urutan tim, filter event, modal, Escape, dan FAQ.
- Form: prefill akun, save/restore/hapus draft per User ID, ekspor JSON, dan keterangan belum terkirim.
- Twibbon: upload, crop/zoom/posisi, reset, dan unduhan PNG valid 1080×1080.
- Webhook: tag HTML sebagai teks, ekspor JSON, mentions kosong, dan kondisi konten kosong.
- Penanganan localStorage yang diblokir dan route yang dibuka langsung.
- Tidak ada uncaught JavaScript exception dalam smoke test.

Sesi/profil browser menggunakan fixture yang diberi nama akun pengujian. Pengujian statistik error/retry dari versi awal tetap ada di smoke script dan sebelumnya lulus menggunakan build undangan tiruan; perubahan versi ini tidak mengubah komponen statistik.

Hasil axe-core 4.10.3 dengan tag WCAG A/AA terkait dicatat di `accessibility-results.json`, meliputi beranda, login, login gate, akun fixture, dan alat sesudah login. Hasil otomatis bukan sertifikasi aksesibilitas penuh.

## Batas verifikasi

Belum diuji: otorisasi dengan akun Discord asli, credential/bot/guild milik pengguna, deployment Vercel nyata dan header CDN-nya, serta seluruh kombinasi browser/perangkat. Setelah environment variables dan redirect terpasang, lakukan pengujian akhir pada domain produksi sesuai `discord-setup.md`.

Tidak ada backend database, penerimaan formulir online, pengiriman webhook, atau sinkronisasi presence/Gateway yang diklaim pada versi ini.

## Screenshot

- `preview-hero.png`, `preview-desktop.png`, `preview-mobile.png`: website dengan konfigurasi asli saat credential belum tersedia; profil tim menampilkan status belum dapat dimuat sampai bot terpasang.
- `preview-login.png`: halaman login sebelum aplikasi Discord dihubungkan.
- `preview-twibbon.png`, `preview-public.png`, `preview-editor.png`: permintaan login sebelum membuka alat.
- `preview-account-test.png`: akun fixture pengujian, bukan pengguna Discord nyata.

## Diagnosis OAuth lanjutan

Pada deployment produksi, endpoint sesi sudah melaporkan konfigurasi tersedia dan API tim berhasil memuat tiga profil. URL otorisasi memakai Application ID serta callback domain baru yang benar. Detail kegagalan callback sebelumnya tidak terekam karena catch mengubah semua error menjadi `discord_unavailable`.

Penanganan error kini memisahkan konfigurasi aplikasi yang ditolak, kode login kedaluwarsa/ditolak, dan gangguan provider. Log server hanya memuat tahap, status HTTP, kode error yang dibatasi, serta label PKCE/redirect. Pengujian memakai respons tiruan untuk invalid client/grant/scope, HTML error, timeout, dan kegagalan profil; juga memastikan deskripsi provider, client secret, dan access token tidak masuk log.

Penyebab spesifik kegagalan otorisasi pengguna belum dapat dikonfirmasi sebelum percobaan login baru menghasilkan log tersebut. Tidak ada perubahan credential atau penonaktifan state/PKCE untuk diagnosis ini.
