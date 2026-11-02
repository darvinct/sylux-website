import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authDestination } from "@/lib/auth-redirect";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextPath = authDestination(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.identities?.some(identity => identity.provider === "discord")) {
        return NextResponse.redirect(new URL(nextPath, origin));
      }
      await supabase.auth.signOut();
    }
  }
  return NextResponse.redirect(new URL("/request?error=auth", origin));
}

