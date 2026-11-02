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

## Verifikasi dalam sesi ini

- `npm test`: **6 pengujian lulus**, mencakup redirect berbahaya, otorisasi OBS, validasi payload, durasi popup, deduplikasi polling, pergantian popup, dan pembatalan timer.
- `npm run typecheck`: dicoba; terhenti karena `tsc` belum terpasang.
- `npm run build`: dicoba; terhenti karena `next` belum terpasang.
- Instalasi dependensi belum berhasil: proxy tidak dapat diakses dari sandbox dan permintaan akses jaringan terhenti. Lockfile aplikasi belum dihasilkan. Jangan menganggap TypeScript atau build sudah lulus.
- `tests/database.sql` tersedia untuk PostgreSQL disposable: kuota dua request, Completed tetap dihitung, Reject membebaskan slot, isolasi member, penolakan anon/non-Discord, eskalasi operator, pemalsuan kolom, transisi, FIFO, dan penerapan schema dua kali. **Belum dijalankan**, PostgreSQL tidak tersedia.
- Login Discord sungguhan, RLS pada Supabase, submit paralel, dashboard di browser, Browser Source OBS, dan deployment Vercel **belum diverifikasi**. Tidak ada konfigurasi Supabase/Discord atau kredensial Vercel di lingkungan ini.

## Batas kepercayaan dan pemeriksaan sebelum produksi

Discord membuktikan kepemilikan akun, bukan keanggotaan guild. Jangan mengklaim portal terbatas pada anggota server tertentu. Nonaktifkan provider login yang tidak diperlukan dan gunakan redirect allow list tepat tanpa wildcard production/preview.

Display name Discord adalah teks pengguna, bukan bukti identitas staff. Moderasi tetap dilakukan sebelum Approved; pesan dirender sebagai teks React, bukan HTML.

Kunci OBS di URL adalah bearer secret. URL dapat terlihat di konfigurasi OBS, histori browser, dan log permintaan halaman pada hosting. Jangan membagikannya dan rotasi `OVERLAY_VIEW_KEY` jika terekspos. Service-role key tidak boleh berawalan `NEXT_PUBLIC_`.

Jalankan fixture SQL hanya pada database kosong disposable; stub auth di-rollback. Ini bukan pengganti Supabase Auth asli. Sebelum produksi, uji minimal tiga submit bersamaan dari satu akun: tepat dua harus tersimpan. Uji pula dua Display Next bersamaan dan pastikan hanya satu baris Now Playing.
