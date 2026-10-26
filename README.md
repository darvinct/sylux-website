# SYLUX Community + Discord

Website komunitas React/TypeScript dengan login OAuth Discord, profil tim dari Discord, dan Vercel Functions. Versi 1.1 menggantikan profil tim contoh dengan akun Discord nyata yang dipilih pemilik website.

**Sudah dibuat:** login/logout, halaman akun, session cookie, proteksi tampilan alat komunitas, direktori tim berdasarkan User ID, pencarian/filter/peran tim, serta fitur komunitas versi awal. Tiga User ID yang kamu berikan sudah dimasukkan dengan peran sementara `Team`; Application ID sudah diisi di `.env.example`. Domain produksi `https://website-komunitasi.vercel.app` sudah diisi di `.env.example`. **Perlu diisi di Vercel:** nilai environment variables, termasuk credential baru aplikasi Discord. Tidak ada secret akunmu dalam ZIP ini.

## Deploy singkat

1. Upload seluruh isi proyek ke repository GitHub. `package.json`, `api/`, `server/`, `src/`, `public/`, dan `vercel.json` berada di root repository.
2. Import repository ke Vercel. Preset **Vite**, install `npm ci`, build `npm run build`, output `dist`.
3. Deploy untuk mendapatkan domain, misalnya `https://website-komunitasi.vercel.app`.
4. Ikuti **[panduan setup Discord](docs/discord-setup.md)**: buat aplikasi Discord, atur redirect URL, masukkan environment variables di Vercel, dan isi `server/team.json`.
5. Redeploy setelah mengisi environment variables. Pakai domain produksi yang sama dengan `SITE_URL` saat menguji login.

Website tetap dapat dibuka saat credential belum diisi. Halaman login menjelaskan bahwa login belum tersedia; profil tim belum dapat dimuat sampai bot terkonfigurasi. Login nyata tidak dapat dipakai hanya dengan deploy ZIP tanpa setup aplikasi Discord.

## Environment variables

Salin nama variabel dari `.env.example` ke **Vercel → Settings → Environment Variables** untuk environment **Production**.

| Variabel | Fungsi |
| --- | --- |
| `SITE_URL` | Origin produksi lengkap, misalnya `https://website-komunitasi.vercel.app`, tanpa subpath |
| `DISCORD_CLIENT_ID` | Application ID dari Discord Developer Portal |
| `DISCORD_CLIENT_SECRET` | Client secret aplikasi, hanya di server |
| `SESSION_SECRET` | Secret acak minimal 32 karakter untuk cookie sesi |
| `DISCORD_BOT_TOKEN` | Bot token untuk mengambil profil tim; tidak dibutuhkan untuk login pengunjung |
| `DISCORD_GUILD_ID` | Opsional; mengambil nickname/avatar server serta memastikan anggota tim ada di server tersebut |
| `VITE_DISCORD_INVITE` | Opsional, undangan publik untuk tombol gabung dan perkiraan statistik |

Client secret, session secret, dan bot token tidak menggunakan awalan `VITE_` dan tidak dimasukkan ke `src/` atau GitHub. Preview deployment memerlukan `SITE_URL` dan redirect Discord yang sesuai jika ingin login di sana; panduan ini menargetkan domain produksi.

## Tim dengan profil Discord

Isi `server/team.json` dengan akun tim yang ingin dipublikasikan. Contoh berikut harus diganti dengan ID milik anggota timmu:

```json
[
  { "id": "123456789012345678", "role": "Founder", "bio": "Pengelola komunitas." },
  { "id": "234567890123456789", "role": "Moderator", "bio": "Menjaga suasana percakapan." }
]
```

Nama, username, avatar, dan tautan profil diambil dari Discord. Jika `DISCORD_GUILD_ID` diisi, nickname dan avatar server digunakan bila tersedia. Peran serta deskripsi `bio` berasal dari file konfigurasi, bukan dari bio pribadi atau role otomatis Discord. Maksimal 30 profil unik. Nama/avatar dapat tertunda beberapa menit karena cache publik. Status online dan aktivitas tidak diambil.

Login pengunjung **tidak otomatis menjadikan mereka anggota tim**. Bot token berada di server, tidak diberikan ke pengunjung. Direktori tim bersifat publik dan dapat dilihat tanpa login.

## Login dan alat komunitas

- Login hanya meminta scope `identify`: ID, nama, username, avatar. Tidak meminta email, pesan, atau izin bergabung server.
- Authorization code + PKCE S256, state browser, dan issuer Discord diverifikasi di backend.
- Website menyimpan profil dasar dalam cookie terenkripsi, HttpOnly, SameSite=Lax, dan Secure pada HTTPS. Sesi berakhir setelah 24 jam; login ulang untuk memperbarui profil akun.
- Access token dan refresh token Discord dipakai sementara saat callback, tidak dipersistenkan dan tidak dikirim ke browser.
- Logout memakai POST dengan pemeriksaan origin dan menghapus cookie browser. Tidak mencabut otorisasi aplikasi di pengaturan Discord. Sesi bersifat stateless; penghapusan cookie tidak mencabut salinan cookie lain sebelum masa berlakunya habis.
- Beranda dan tim bersifat publik. Twibbon, form, dan editor webhook meminta login untuk membuka UI.
- Alat tersebut masih bekerja lokal: Twibbon mengunduh PNG; form menyimpan draft per akun di perangkat dan mengekspor JSON; webhook hanya preview/ekspor JSON. Tidak ada database atau pengiriman formulir/webhook ke server. Jika menambahkan aksi server di masa depan, endpoint aksi tersebut juga harus memverifikasi sesi, bukan mengandalkan tampilan login.

## Identitas dan konten

Identitas SYLUX menggunakan logo yang diberikan pengelola dan gradasi violet, ungu, serta biru berdasarkan poster referensi. Edit `src/data/site.ts` untuk tagline, undangan, Instagram, email kontak opsional, copy ID/EN, dan kegiatan. Kegiatan awal masih contoh; ubah sebelum mematikan `isDemo`. Tim diatur terpisah di `server/team.json`.

Ubah metadata SEO dan Open Graph di `index.html`. Setelah mendapat domain, gunakan URL absolut gambar Open Graph. Gambar berada di `public/images/`, font di `public/fonts/`, dan token warna di `src/styles.css`. Sumber aset ada di `docs/assets.md`.

## Jalankan lokal

Gunakan Node.js 24 LTS atau Node.js 22.18+.

```sh
npm ci
cp .env.example .env.local
```

Isi `.env.local` untuk pengujian lokal. Gunakan `SITE_URL=http://localhost:5173` dan tambahkan `http://localhost:5173/api/auth/callback` pada daftar redirect Discord. `.env.local` diabaikan Git.

Jalankan dua terminal:

```sh
npm run dev:api
```

```sh
npm run dev
```

Vite meneruskan `/api` ke server lokal di port 3001. Buka **http://localhost:5173**, bukan alamat IP LAN, agar cookie dan callback sesuai. Server lokal tetap berjalan tanpa credential, dengan status login belum tersedia dan profil tim belum dapat dimuat sampai bot terpasang. File `server/dev.mjs` hanya untuk lokal; Vercel menjalankan file di `api/` sebagai Functions.

## Verifikasi

```sh
npm run check
npm run build
npm run preview
```

`check` memeriksa validasi undangan/filter/ekspor, OAuth state/PKCE/issuer, token exchange, sesi terenkripsi/kedaluwarsa, origin logout, dan pembatasan data profil tim. Pengujian Discord menggunakan respons tiruan dan tidak memanggil akun nyata.

Pengujian browser menggunakan session/team fixtures untuk memeriksa UI dan alat lokal, termasuk login gate dan logout:

```sh
python -m pip install playwright
python -m playwright install chromium
# Jalankan npm run dev atau preview di terminal lain.
python scripts/smoke.py
# Untuk production preview di port 4173:
BASE_URL=http://localhost:4173 python scripts/smoke.py
```

Hasil dan batas verifikasi ada di `docs/verification.md`. Login end-to-end dengan akun Discord dan deploy Vercel milikmu baru bisa diperiksa setelah credential dan redirect URL terpasang.
