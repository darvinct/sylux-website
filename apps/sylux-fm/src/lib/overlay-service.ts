import { getSupabaseConfig } from "./supabase/config.ts";

// This is a configuration check, never a substitute for Supabase verification.
export function isPublicSupabaseKey(key: string): boolean {
  if (key.startsWith("sb_publishable_")) return true;
  try {
    const payload = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString());
    return payload.role === "anon";
  } catch {
    return false;
  }
}

export function getOverlayServiceConfig() {
  const settings = getSupabaseConfig(
    process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
  return settings && !isPublicSupabaseKey(settings.key) ? settings : null;
}
