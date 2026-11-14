import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOverlayServiceConfig } from "@/lib/overlay-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store, max-age=0", "Referrer-Policy": "no-referrer" };

export async function GET() {
  try {
    const client = await createClient();
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) return NextResponse.json({ error: "Silakan login kembali." }, { status: 401, headers });
    const { data: allowed, error: roleError } = await client.rpc("is_operator", { _uid: user.id });
    if (roleError || allowed !== true) {
      return NextResponse.json({ error: "Hanya operator yang dapat mengambil URL OBS." }, { status: 403, headers });
    }
    const key = process.env.OVERLAY_VIEW_KEY ?? "";
    if (key.length < 32) {
      return NextResponse.json({ error: "OVERLAY_VIEW_KEY harus minimal 32 karakter. Perbarui di Vercel lalu redeploy." }, { status: 503, headers });
    }
    if (!getOverlayServiceConfig()) {
      return NextResponse.json({ error: "Periksa SUPABASE_SERVICE_ROLE_KEY di Vercel: gunakan service_role atau secret key Supabase, lalu redeploy." }, { status: 503, headers });
    }
    // Return a relative path; the browser supplies its own trusted origin.
    return NextResponse.json({ path: "/overlay?" + new URLSearchParams({ key }).toString() }, { headers });
  } catch {
    return NextResponse.json({ error: "Konfigurasi koneksi OBS belum tersedia." }, { status: 503, headers });
  }
}
