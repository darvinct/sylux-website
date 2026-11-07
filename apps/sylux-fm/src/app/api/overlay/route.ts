import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hasOverlayAccess } from "@/lib/overlay-access";
import { getOverlayServiceConfig, isPublicSupabaseKey } from "@/lib/overlay-service";
import { publicSenderName } from "@/lib/requests";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const key = request.headers.get("x-overlay-key") ?? "";
  const expected = process.env.OVERLAY_VIEW_KEY ?? "";
  if (expected.length < 32) {
    return NextResponse.json({ error: "Overlay key not configured", code: "OVERLAY_KEY_NOT_CONFIGURED" },
      { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  if (!hasOverlayAccess(key, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  const settings = getOverlayServiceConfig();
  if (!settings) {
    const code = isPublicSupabaseKey(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "")
      ? "OVERLAY_SERVICE_ROLE_REQUIRED" : "OVERLAY_SERVICE_NOT_CONFIGURED";
    console.error("OBS service configuration invalid", { code });
    return NextResponse.json({ error: "Service not configured", code }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const admin = createClient(settings.url, settings.key, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data, error, status } = await admin
      .from("radio_requests")
      .select("id,username,is_anonymous,song_title,artist,dedication_to,message,updated_at")
      .eq("status", "now_playing")
      .maybeSingle();

    if (error) {
      // Log only a bounded error code. Provider messages may contain private data.
      const code = /^[A-Za-z0-9_]{1,40}$/.test(error.code ?? "") ? error.code : "UNKNOWN";
      console.error("OBS database lookup failed", { code, status });
      return NextResponse.json({ error: "Unable to retrieve current request", code: "OVERLAY_DATABASE_UNAVAILABLE" },
        { status: 500, headers: { "Cache-Control": "no-store" } });
    }
    // Never send an anonymous listener\u0027s real display name to OBS/browser clients.
    const active = data ? { ...data, username: publicSenderName(data) } : null;
    return NextResponse.json({ active }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch {
    console.error("OBS database connection unavailable");
    return NextResponse.json({ error: "Overlay unavailable", code: "OVERLAY_DATABASE_UNAVAILABLE" },
      { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

