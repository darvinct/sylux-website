# Galeri tim SYLUX

Desain ini disiapkan melalui cabang `preview/team-gallery`. Pengelola meminta perubahan terbaru diterapkan langsung ke produksi pada 27 Oktober 2026.

- Dua Founder menjadi kartu visual besar, memakai avatar dan banner Discord asli. Banner diminta sebagai WebP statis untuk tampilan kartu; modal profil tetap mempertahankan sumber aslinya.
- Owner mendapat satu baris lebar dengan identitas yang lebih besar.
- Developer tampil dalam grid yang lebih rapat, empat kolom di desktop dan dua kolom di HP.
- Urutan Founder → Owner → Developer, daftar 11 User ID, pencarian, filter peran, A–Z, shortcut `/`, ringkas kelompok, serta modal profil tetap dipakai.
- Hover dan fokus keyboard menampilkan View Profile. Tap di HP langsung membuka profil. Preferensi reduced motion tetap dihormati.

Endpoint tim Preview membaca API produksi publik saat bot token tidak tersedia. Tidak menyalin secret produksi. Halaman pratinjau menggunakan perlindungan Vercel dan tautan akses sementara untuk pengelola.

Validasi: build, pemeriksaan yang sudah tersedia, browser smoke, dan pemeriksaan tata letak 320–1440 px dengan 11 profil asli serta banner yang berhasil dimuat.
