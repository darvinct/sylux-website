# SYLUX FM — Request & Dedication

Aplikasi Next.js terpisah di `apps/sylux-fm`, dengan desain minimalis, login Discord, moderasi, antrean FIFO, dan popup OBS. Host membaca pesan dan memutar lagu secara manual. Aplikasi tidak mengunggah atau memutar audio.

## Menjalankan lokal

Gunakan Node.js 24 dari folder aplikasi:

```sh
cd apps/sylux-fm
npm ci
cp .env.example .env.local
npm test
npm run typecheck
npm run build
npm run dev
```

Isi `.env.local` dengan konfigurasi Supabase. Jangan commit file tersebut. Lockfile aplikasi disimpan; gunakan `npm ci` untuk pemasangan dependensi yang dapat diulang.

1. Jalankan `supabase/schema.sql` di Supabase SQL Editor. Untuk instalasi sebelumnya, jalankan ulang file lengkap sebelum memakai frontend baru: dashboard sekarang memakai RPC `moderate_request`, dan insert member tidak lagi mengirim username/status. Terapkan pada proyek test/staging dahulu.
2. Di Discord Developer Portal, buat aplikasi OAuth. Aktifkan provider Discord di Supabase Auth dan masukkan client ID/secret. Redirect Discord menuju callback provider yang ditampilkan Supabase, biasanya `https://PROJECT.supabase.co/auth/v1/callback`.
3. Di Supabase Auth URL Configuration, atur Site URL ke origin aplikasi FM. Tambahkan URL callback yang tepat: `http://localhost:3000/auth/callback` serta `https://DOMAIN-FM/auth/callback`. Gunakan allow list terpisah untuk staging/preview; jangan memakai wildcard production.
4. Login Discord sekali di `/request`, lalu salin UUID akun dari Supabase Authentication → Users. Tambahkan operator melalui SQL Editor sebagai admin database:

```sql
insert into public.radio_operators(user_id) values ('UUID-AKUN-DISCORD-OPERATOR');
```

Jangan mengambil keputusan role dari display name, email, atau metadata user. Login Discord tidak memverifikasi keanggotaan guild.

## Perilaku aplikasi

- Maksimal **dua request non-Rejected per akun selama event**. Completed tetap dihitung; Reject membebaskan slot. Kuota dilindungi trigger database dengan lock per akun.
- Member mengisi lagu, artis, penerima opsional, dan pesan maksimal 500 karakter. Member hanya melihat request sendiri.
- `/admin` hanya untuk operator whitelist. Approve/Reject memoderasi Pending. Display Next memilih Approved paling awal berdasarkan waktu pengiriman dan ID; request sebelumnya menjadi Completed. Antrean kosong tidak mengakhiri request aktif. Finish mengakhiri request aktif.
- Antrean dashboard dan status request member diperbarui setiap lima detik. Audio tetap dioperasikan manual oleh host.
- Preview visual popup: `/overlay?preview=1`, tanpa data asli atau kunci.
- OBS Browser Source: `https://DOMAIN-FM/overlay?key=SECRET`, resolusi 1920×1080. Background transparan; popup tampil sekali selama 12 detik per request aktif. API diperiksa tiap 2,5 detik setelah respons sebelumnya selesai. Finish menyembunyikan popup pada poll berikutnya.

Gunakan kunci acak minimal 32 karakter. Contoh pembuatan lokal:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

## Deployment Vercel terpisah

Buat **proyek Vercel baru khusus SYLUX FM** yang memakai repositori yang sama:

| Pengaturan | Nilai |
| --- | --- |
| Root Directory | `apps/sylux-fm` |
| Framework | Next.js |
| Node.js | 24.x |
| Production Branch proyek FM | `feature/sylux-fm-request-system` jika branch ini menjadi sumber deployment |
| Install Command | `npm ci` (lockfile aplikasi tersedia) |
| Build Command | Dari `vercel.json`: TypeScript → test → Next build |
| Output Directory | Default Next.js |

Atur variabel per lingkungan melalui Vercel; rebuild setelah mengubah `NEXT_PUBLIC_*`:

| Variabel | Lingkup |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL proyek Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/publishable key; data tetap dibatasi RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret server untuk membaca popup aktif |
| `OVERLAY_VIEW_KEY` | Secret acak minimal 32 karakter untuk OBS |

Jangan mengubah Root Directory, domain, environment variables, Production Branch, atau `vercel.json` milik proyek website utama. Konfigurasi deployment aplikasi ini berada di folder FM sendiri.

## Pemeriksaan sebelum mengudara

`npm test` tidak memerlukan dependensi eksternal pada Node 24. Uji database menggunakan PostgreSQL kosong disposable dengan role yang dapat membuat schema/role:

```sh
psql "$SYLUX_TEST_DATABASE_URL" -X -f tests/database.sql
```

Jangan arahkan uji fixture ke Supabase atau production. Tes menolak database yang sudah memiliki `auth.users` atau `radio_requests`, lalu rollback seluruh fixture.

Di staging, verifikasi login/logout Discord, penolakan nonoperator, kuota termasuk tiga submit paralel, moderasi, FIFO, Finish, pergantian akun, kunci OBS salah/benar, popup 12 detik tanpa pengulangan, dan transparansi di OBS sebenarnya.

Status verifikasi: **TypeScript, build produksi, 6 uji unit, uji PostgreSQL, dan uji paralel lulus**. Audit dependensi produksi melaporkan **0 kerentanan** setelah override PostCSS ke 8.5.32. Uji browser memakai fixture lokal, bukan akun Discord/Supabase asli. Deployment Vercel belum dilakukan. Lihat [SECURITY.md](SECURITY.md).

Untuk menjalankan uji database dan paralel memakai container PostgreSQL disposable lokal:

```sh
docker run --detach --rm --name sylux-fm-tests \
  --env POSTGRES_HOST_AUTH_METHOD=trust --env POSTGRES_DB=sylux_fm_tests \
  --mount type=bind,src="$PWD",dst=/app,readonly postgres:17-alpine
# Tunggu pg_isready mengembalikan exit code 0 sebelum menjalankan tes.
docker exec sylux-fm-tests pg_isready -U postgres
docker exec --workdir /app sylux-fm-tests psql -U postgres -d sylux_fm_tests -X -q -f tests/database.sql
python3 tests/concurrency.py sylux-fm-tests
docker stop sylux-fm-tests
```

Container ini tidak mengekspos port ke jaringan. `tests/concurrency.py` membuat database test sendiri, memakai koneksi terpisah untuk lima putaran submit/Display Next bersamaan, lalu menghapus database tersebut.

Uji browser membutuhkan Python Playwright dan Chromium di `/usr/bin/chromium`:

```sh
python3 tests/browser.py
```

Tes ini menjalankan salinan aplikasi sementara di port 3001 dan fixture Supabase lokal di port 54321. File environment production tidak disalin. Endpoint simulasi hanya digunakan untuk menguji UI; pemeriksaan otorisasi database sebenarnya tetap diuji oleh `database.sql`.

## Jika muncul 500 MIDDLEWARE_INVOCATION_FAILED

`NEXT_PUBLIC_SUPABASE_URL` harus berupa **Project URL**, misalnya `https://PROJECT-ID.supabase.co`. Nilai `sb_publishable_...` adalah API key dan ditempatkan di `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Setelah memperbaiki environment variable di Vercel, redeploy karena `NEXT_PUBLIC_*` juga dipakai saat build.

Konfigurasi diperiksa sebelum SDK dibuat di browser, server, middleware, dan endpoint OBS. Konfigurasi invalid menonaktifkan login, mengarahkan callback ke halaman login, dan memberi API OBS respons 503. Kegagalan refresh sesi tidak memberikan hak akses; RLS dan RPC tetap memeriksa sesi sebenarnya.

Uji regresi konfigurasi invalid:

```sh
SYLUX_BROWSER_TEST_MODE=invalid-config python3 tests/browser.py
```
