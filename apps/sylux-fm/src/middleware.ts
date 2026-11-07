import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function middleware(request: NextRequest) {
  const settings = getSupabaseConfig(
    process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  if (!settings) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  try {
    const supabase = createServerClient(settings.url, settings.key, {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(entries: { name: string; value: string; options: CookieOptions }[]) {
          entries.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          entries.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    });
    await supabase.auth.getUser();
  } catch {
    // Refresh is best-effort. Access to data still requires a verified Supabase
    // session and RLS; a refresh/configuration failure never grants a role.
    console.warn("Supabase session refresh unavailable");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/overlay|overlay).*)"]
};

