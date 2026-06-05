import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin/overview";

  if (code) {
    const supabase = await createServerSupabase();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const safeNext = next.startsWith("/") ? next : "/admin/overview";
        return NextResponse.redirect(`${origin}${safeNext}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/admin/login?error=auth`);
}
