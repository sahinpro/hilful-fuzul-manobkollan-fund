import { requireAdminApi } from "@/lib/admin/auth";
import { createServiceSupabase } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const LIST_COLUMNS =
  "id, donor_full_name, donor_fathers_name, amount_bdt, payment_method, trx_id, status, source, created_at, expires_at, confirmed_at, donation_id";

export async function GET(request: Request) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const supabase = createServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY or URL missing on server." },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status")?.trim() || "pending";
  const limit = Math.min(
    200,
    Math.max(1, Number(url.searchParams.get("limit")) || 100),
  );

  let query = supabase
    .from("donation_intents")
    .select(LIST_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data: intents, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ intents: intents ?? [] });
}
