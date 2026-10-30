# Aset SYLUX

## Identitas dan tampilan

| Berkas | Pemakaian |
| --- | --- |
| `public/images/sylux-logo.webp` | Logo pada navbar, hero, footer, dan profil tim. |
| `public/images/favicon-32.png` | Favicon website. |
| `public/images/sylux-community-mascot-blue.webp` | Maskot penutup di Beranda dan Informasi. |
| `public/images/sylux-join-qr.svg` | Kode QR untuk `https://discord.gg/sylux`. |
| `public/images/sylux-share-cover-v7.jpg` | Gambar pratinjau tautan Discord dan Open Graph. |
| `public/images/sylux-share-icon-v3.png` | Thumbnail pada pratinjau tautan. |
| `docs/sylux-home.png` | Screenshot beranda untuk README. |

Logo dan maskot berasal dari pengelola SYLUX. Latar website memakai gradasi CSS di `src/styles.css`.

## Dokumentasi event

Foto asli dari pengelola disimpan di `public/images/`:

- `luxstars-documentation.png`
- `sylux-got-talent-s2-documentation.png`
- `boo-the-show-documentation.png`
- `jealousy-documentation.png`
- `spooktacular-beyond-the-dark-documentation.png`
- `bolehkah-pikiranku-istirahat-documentation.png`

Daftar event dan referensi gambar berada di `src/data/site.ts`.

## Font dan ikon

- [Satoshi](https://www.fontshare.com/fonts/satoshi) memakai font variabel resmi dengan bobot 300 sampai 900. `scripts/prepare-fonts.mjs` mengambil berkas WOFF2 tanpa perubahan dari CDN Fontshare saat `dev` atau `build`, lalu menyimpannya di `public/fonts/` untuk disajikan lokal. Berkas font diabaikan Git. Lisensi ITF Free Font License ada di `public/fonts/SATOSHI-FFL.txt`.
- Ikon memakai [Phosphor](https://phosphoricons.com/) melalui `@phosphor-icons/react`, dengan lisensi MIT.
