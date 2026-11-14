import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authDestination } from "@/lib/auth-redirect";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextPath = authDestination(searchParams.get("next"));

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.identities?.some(identity => identity.provider === "discord")) {
          return NextResponse.redirect(new URL(nextPath, origin));
        }
        await supabase.auth.signOut();
      }
    } catch {
      // A configuration or provider failure must return the member to the login
      // page. Never log codes, tokens, or provider error messages here.
      console.warn("Supabase OAuth callback unavailable");
    }
  }
  return NextResponse.redirect(new URL("/request?error=auth", origin));
}

