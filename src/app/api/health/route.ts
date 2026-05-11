import { NextResponse } from "next/server";
import { isServiceSupabaseConfigured } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    publicSupabase: isSupabaseConfigured(),
    serviceSupabase: isServiceSupabaseConfigured(),
    adminApiToken: Boolean(process.env.ADMIN_API_TOKEN?.trim()),
  });
}
