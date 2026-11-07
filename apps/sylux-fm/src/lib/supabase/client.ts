"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

export function createClient() {
  const settings = getSupabaseConfig(
    process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  if (!settings) throw new Error("Invalid public Supabase configuration.");
  return createBrowserClient(settings.url, settings.key);
}
