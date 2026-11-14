export function overlayErrorMessage(status: number, code?: unknown): string {
  if (status === 401) return "Kunci OBS tidak cocok. Salin URL OBS dari Control Room.";
  if (code === "OVERLAY_KEY_NOT_CONFIGURED") {
    return "OVERLAY_VIEW_KEY di Vercel harus minimal 32 karakter. Perbarui lalu redeploy.";
  }
  if (code === "OVERLAY_SERVICE_ROLE_REQUIRED") {
    return "SUPABASE_SERVICE_ROLE_KEY harus memakai service_role atau secret key Supabase. Perbarui di Vercel lalu redeploy.";
  }
  if (status === 503) return "Konfigurasi Supabase untuk OBS belum lengkap. Periksa pengaturan server.";
  if (status >= 500) return "Server belum dapat membaca popup dari Supabase. Periksa konfigurasi server.";
  return "Koneksi overlay terputus. Coba Refresh Browser Source OBS.";
}
