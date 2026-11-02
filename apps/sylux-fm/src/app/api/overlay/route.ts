import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function sameSecret(received: string, expected: string) {
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  const key = request.headers.get("x-overlay-key") ?? "";
  const expected = process.env.OVERLAY_VIEW_KEY ?? "";
  if (expected.length < 32 || !sameSecret(key, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const role = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !role) {
    return NextResponse.json({ error: "Service not configured" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const admin = createClient(url, role, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await admin
    .from("radio_requests")
    .select("id,username,song_title,artist,dedication_to,message,updated_at")
    .eq("status", "now_playing")
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Unable to retrieve current request" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  return NextResponse.json({ active: data ?? null }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
