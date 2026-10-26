# Setup login dan profil tim Discord

Panduan ini dikerjakan dari browser HP/laptop. Termux tetap dipakai untuk upload/push kode.

Application ID `1179801331821711441` dan tiga User ID tim sudah dimasukkan ke file proyek. Peran sementara semuanya `Team`. Karena Bot Token dan Client Secret pernah dikirim melalui chat, reset keduanya di Developer Portal dan gunakan nilai baru di Vercel. ZIP tidak berisi secret tersebut.

## Status deployment yang diperiksa

Pemeriksaan pada 26 Oktober 2026 terhadap https://website-komunitas-zeta.vercel.app/ menunjukkan website aktif dengan bundle versi awal. Bundle belum memuat login Discord atau API tim. `/api/auth/session` dan `/api/team` saat itu mengembalikan HTML, sehingga backend baru belum ter-deploy. Unggah isi ZIP terbaru, termasuk `api/`, `server/`, dan `vercel.json`, sebelum mengisi environment variables dan redeploy.

## 1. Dapatkan domain Vercel

Domain produksi milikmu: `https://website-komunitas-zeta.vercel.app`. Konfigurasi contoh sudah memakai domain ini.

## 2. Buat aplikasi Discord

1. Buka https://discord.com/developers/applications dan login.
2. Pilih **New Application**, lalu beri nama komunitasmu.
3. Di **General Information**, salin **Application ID**. Ini nilai `DISCORD_CLIENT_ID`.
4. Buka **OAuth2**. Salin/reset **Client Secret** jika diperlukan. Simpan langsung sebagai `DISCORD_CLIENT_SECRET` di Vercel.
5. Pada daftar **Redirects**, tambahkan tepat:

   ```text
   https://website-komunitas-zeta.vercel.app/api/auth/callback
   ```

6. Simpan perubahan. URL harus sama persis, termasuk HTTPS, domain, dan path. Tidak perlu membuat URL OAuth manual untuk pengunjung: tombol website sudah membentuknya dengan scope `identify`, PKCE, dan state.

## 3. Isi environment variables Vercel

Buka proyek → **Settings → Environment Variables**. Isi untuk **Production**:

```text
SITE_URL=https://website-komunitas-zeta.vercel.app
DISCORD_CLIENT_ID=1179801331821711441
DISCORD_CLIENT_SECRET=Client Secret milikmu
SESSION_SECRET=secret acak milikmu dengan panjang minimal 32 karakter
```

Gunakan secret acak baru untuk `SESSION_SECRET`, bukan password Discord. Jika memakai Termux dan Node.js sudah tersedia, buat nilainya dengan:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Jika belum ada Node.js, instal dengan `pkg install nodejs-lts`, lalu jalankan perintah tadi. Salin hasilnya langsung ke Vercel. Jangan menaruh secret di source atau mengirimkannya ke chat.

## 4. Bot untuk profil tim

Bot diperlukan agar website dapat mengambil profil anggota yang kamu pilih meskipun mereka belum pernah login ke website.

1. Pada aplikasi Discord yang sama, buka **Bot**.
2. Dapatkan/reset token bot, lalu simpan langsung sebagai `DISCORD_BOT_TOKEN` di Vercel.
3. Undang bot ke server komunitasmu. Gunakan **OAuth2 URL Generator** dengan scope `bot`; tidak perlu izin Administrator untuk fitur baca profil ini. Contoh URL, ganti `APPLICATION_ID`:

   ```text
   https://discord.com/oauth2/authorize?client_id=APPLICATION_ID&scope=bot&permissions=0
   ```

4. Bot cukup menjadi anggota server untuk pengambilan profil anggota terpilih ini. Tidak ada proses Gateway atau bot yang perlu dijalankan terus-menerus di Termux; Vercel memanggil REST API Discord saat diperlukan.
5. Opsional, isi `DISCORD_GUILD_ID` dengan Server ID agar website menggunakan nickname/avatar server dan hanya menampilkan profil yang ada di server tersebut. Implementasi mengambil anggota satu per satu, bukan memindai daftar seluruh member.

Bot token berbeda dari Client Secret. Login hanya membutuhkan konfigurasi langkah 2–3, sedangkan direktori tim juga membutuhkan langkah 4–5.

## 5. Masukkan akun tim

1. Pada Discord, aktifkan **User Settings → Advanced → Developer Mode**.
2. Buka profil anggota tim, pilih **Copy User ID**. Yang digunakan adalah angka User ID, bukan username, link invite, atau nama tampilan.
3. Untuk Server ID, gunakan menu server → **Copy Server ID**.
4. Edit `server/team.json`. Contoh format, ganti semua ID berikut:

   ```json
   [
     { "id": "123456789012345678", "role": "Owner", "bio": "Pengelola komunitas." },
     { "id": "234567890123456789", "role": "Moderator", "bio": "Menjaga percakapan tetap nyaman." }
   ]
   ```

5. Commit/push perubahan file itu. Jangan memasukkan token ke JSON. Nama/avatar/username tidak perlu diisi manual; website mengambilnya dari Discord. Peran dan bio adalah deskripsi tim yang kamu tentukan.

## 6. Redeploy dan uji

Setelah environment variables diisi, lakukan **Redeploy** di Vercel. Membuat commit baru juga memicu deploy jika integrasi GitHub aktif.

- Buka domain produksi yang sama dengan `SITE_URL`.
- Klik **Masuk**, lalu **Masuk dengan Discord**, dan setujui akses profil dasar di Discord.
- Pastikan kembali ke website dengan avatar/nama akunmu. Halaman `/account` menampilkan ID dan tombol logout.
- Buka bagian Team: harus menampilkan profil sesuai `server/team.json`. Pengunjung yang sekadar login tidak ditambahkan ke tim.
- Ubah avatar di Discord untuk menguji sinkronisasi tim; cache dapat menunda pembaruan beberapa menit. Profil akun sesi diperbarui saat login ulang.
- Setelah logout, alat komunitas kembali meminta login.

Jika `redirect_uri` ditolak, cocokkan redirect di Discord dengan `${SITE_URL}/api/auth/callback`. Jika kembali dengan pesan tautan login tidak valid, mulai login baru dari domain produksi yang benar dan pastikan cookie browser diizinkan. Jika profil tim gagal, periksa Bot Token, User ID, keanggotaan bot/anggota di server, serta Server ID jika digunakan. Jangan membagikan nilai token dalam screenshot atau log.

## Update lewat Termux

Untuk folder/repository yang dibuat mengikuti percakapan sebelumnya:

```sh
unzip -o ~/storage/downloads/nocturne-discord-vercel.zip -d ~/website-komunitas
cd ~/website-komunitas/nocturne
git add .
git commit -m "Tambahkan login Discord dan profil tim"
git push
```

Jika nama ZIP hasil download memiliki tambahan seperti `(1)`, sesuaikan nama berkas pada perintah `unzip`.

ZIP sudah mengabaikan `.env.local`. Pastikan `api/` dan `server/` ikut terunggah. Seluruh environment variable rahasia diisi di Vercel, bukan file yang di-push.

## Rujukan resmi

- OAuth2 dan scope Discord: https://docs.discord.com/developers/topics/oauth2
- Metadata OAuth, termasuk dukungan PKCE S256: https://discord.com/.well-known/oauth-authorization-server
- Profil user: https://docs.discord.com/developers/resources/user
- Profil anggota server: https://docs.discord.com/developers/resources/guild#get-guild-member
- Vercel Node Functions: https://vercel.com/docs/functions/runtimes/node-js
