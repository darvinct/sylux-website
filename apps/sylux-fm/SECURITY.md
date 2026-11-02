# Audit keamanan SYLUX FM

Perubahan hanya untuk `apps/sylux-fm`. Website utama dan konfigurasi Vercel di root tidak diubah.

## Perbaikan

- Callback OAuth hanya menerima `/request` atau `/admin`. URL eksternal, backslash, whitespace, dan path lain kembali ke `/request`. Sesi ditukar melalui PKCE Supabase dan diverifikasi dengan `getUser()` serta identitas Discord.
- RLS memerlukan identitas Discord di `auth.identities`, bukan metadata yang bisa diubah member. Whitelist operator tetap berupa UUID di `radio_operators`; klien tidak dapat menambah dirinya sendiri.
- Member hanya membaca request sendiri dan memasukkan kolom formulir yang diizinkan. Nama, status awal, UUID request, dan timestamp antrean ditentukan database. `is_operator` hanya memeriksa akun pemanggil.
- UPDATE/DELETE langsung ditolak, termasuk dari klien operator. RPC `moderate_request` memvalidasi Pending → Approved/Rejected dan Now Playing → Completed. Display Next memakai lock yang sama, memilih Approved berdasarkan `(created_at,id)`, dan mempertahankan request aktif saat antrean kosong.
- Kuota dua request non-Rejected tetap berlaku selama event, termasuk Completed. Trigger memakai advisory lock per akun. Reject membebaskan slot; klien operator tidak dapat mengaktifkan ulang Rejected.
- Fungsi dengan hak elevated memakai `search_path` kosong dan nama tabel lengkap. Akses tabel/fungsi dibatasi secara eksplisit. Service role hanya digunakan server pada endpoint OBS yang mengeluarkan field popup aktif.
- Otorisasi OBS memeriksa panjang byte dan `timingSafeEqual`; kunci minimal 32 karakter. API tidak di-cache. `Referrer-Policy: no-referrer` mencegah URL kunci terkirim sebagai referrer.
- Poll OBS berjalan berurutan. Cleanup membatalkan fetch dan kedua timer popup. Error/standby menyembunyikan popup. Poll identik tidak mengulang popup; popup hilang setelah 12 detik. Tidak ada audio atau perpindahan lagu otomatis.
- Pergantian akun menghapus antrean di UI dan mengabaikan fetch akun sebelumnya. Nama/judul panjang dibungkus tanpa merusak desain minimalis.

## Verifikasi pada 2 November 2026

- `npm run typecheck`: **lulus**, setelah memperbaiki tipe callback cookie Supabase di server dan middleware.
- `npm run build`: **lulus**, Next.js 15.5.28. `outputFileTracingRoot` dibatasi ke folder aplikasi agar lockfile website utama tidak dipilih sebagai root.
- `npm test`: **6 pengujian lulus**, mencakup redirect berbahaya, kunci OBS, validasi payload, timer popup, deduplikasi, pergantian popup, dan cleanup.
- `tests/database.sql`: **lulus pada PostgreSQL 17 disposable**, mencakup kuota, Completed tetap dihitung, Reject membebaskan slot, isolasi member, anon/non-Discord, eskalasi operator, pemalsuan kolom, transisi, FIFO, dan penerapan schema dua kali.
- `tests/concurrency.py`: **5 putaran lulus** menggunakan koneksi PostgreSQL terpisah. Dari tiga submit bersamaan tepat dua tersimpan dan satu ditolak SQLSTATE 23514. Dua Display Next bersamaan selalu menghasilkan satu Now Playing dan satu Completed.
- Audit dependensi produksi: **0 kerentanan**. Next.js membawa PostCSS 8.4.31 yang rentan; aplikasi meng-override ke 8.5.32 dan menyimpan lockfile. Vercel memakai `npm ci`.
- Uji browser dijalankan dengan Chromium/Playwright dan fixture Auth/PostgREST lokal, meliputi halaman logout, akses nonoperator, dua submit, kolom insert, moderasi, FIFO, Finish, serta popup OBS dan header API. Ini bukan pengujian provider Discord atau layanan Supabase asli.
- Server produksi lokal merespons `/request`, `/admin`, `/overlay?preview=1` dengan HTTP 200; `/api/overlay` tanpa kunci ditolak HTTP 401 dengan `Cache-Control: no-store`.
- Login Discord sungguhan, proyek Supabase sebenarnya, aplikasi OBS desktop, dan deployment Vercel **belum diverifikasi**: kredensial/konfigurasinya belum tersedia. Schema hanya diterapkan pada database test disposable, bukan production.

## Batas kepercayaan dan pemeriksaan sebelum produksi

Discord membuktikan kepemilikan akun, bukan keanggotaan guild. Jangan mengklaim portal terbatas pada anggota server tertentu. Nonaktifkan provider login yang tidak diperlukan dan gunakan redirect allow list tepat tanpa wildcard production/preview.

Display name Discord adalah teks pengguna, bukan bukti identitas staff. Moderasi tetap dilakukan sebelum Approved; pesan dirender sebagai teks React, bukan HTML.

Kunci OBS di URL adalah bearer secret. URL dapat terlihat di konfigurasi OBS, histori browser, dan log permintaan halaman pada hosting. Jangan membagikannya dan rotasi `OVERLAY_VIEW_KEY` jika terekspos. Service-role key tidak boleh berawalan `NEXT_PUBLIC_`.

Jalankan fixture SQL hanya pada database kosong disposable; stub auth di-rollback. Ini bukan pengganti Supabase Auth asli. Pengujian paralel tersebut sudah lulus pada PostgreSQL lokal; ulangi smoke test pada proyek staging Supabase sebelum production.
