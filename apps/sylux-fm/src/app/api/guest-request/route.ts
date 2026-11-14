import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getOverlayServiceConfig } from "@/lib/overlay-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const settings = getOverlayServiceConfig();
  const secret = process.env.OVERLAY_VIEW_KEY;
  if (!settings || !secret || secret.length < 32) {
    return NextResponse.json({ error: "Submission service unavailable." }, { status: 503 });
  }
  const size = Number(request.headers.get("content-length") ?? "0");
  if (size > 8192) return NextResponse.json({ error: "Request too large." }, { status: 413 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw Error();
  } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const get = (key: string) => typeof body[key] === "string" ? (body[key] as string).trim() : "";
  const anonymous = body.is_anonymous === true;
  const name = get("display_name"), song = get("song_title"), artist = get("artist");
  const message = get("message"), dedication = get("dedication_to");
  if ((!anonymous && (name.length < 1 || name.length > 64)) ||
      !song || song.length > 120 || !artist || artist.length > 120 ||
      !message || message.length > 500 || dedication.length > 64 ||
      typeof body.is_anonymous !== "boolean") {
    return NextResponse.json({ error: "Please complete the required fields." }, { status: 400 });
  }
  // Vercel's trusted forwarding headers supply the client address. Never trust an
  // arbitrary user-provided identity for moderation or authentication.
  const ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
  const visitorHash = createHmac("sha256", secret).update(ip).digest("hex");
  try {
    const admin = createClient(settings.url, settings.key, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const { error } = await admin.rpc("submit_guest_radio_request", {
      p_visitor_hash: visitorHash, p_display_name: anonymous ? "Anonymous" : name,
      p_is_anonymous: anonymous, p_song_title: song, p_artist: artist,
      p_dedication_to: dedication, p_message: message
    });
    if (error) {
      if (error.code === "P0001") return NextResponse.json(
        { error: "Please wait 60 seconds before sending another request." }, { status: 429 });
      console.error("Guest submission failed", { code: error.code });
      return NextResponse.json({ error: "Unable to submit request." }, { status: 503 });
    }
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Submission service unavailable." }, { status: 503 });
  }
}
