import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

export async function createClient() {
  const cookieStore = await cookies();
  const settings = getSupabaseConfig(
    process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  if (!settings) throw new Error("Invalid Supabase configuration.");
  return createServerClient(settings.url, settings.key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(entries: { name: string; value: string; options: CookieOptions }[]) {
        try {
          entries.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // In Server Components, middleware handles cookie refresh instead.
        }
      }
    }
  });
}
