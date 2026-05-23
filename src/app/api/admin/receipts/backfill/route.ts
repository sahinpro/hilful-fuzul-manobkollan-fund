import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { ensureDonationReceipt } from "@/lib/receipt/ensure-donation-receipt";
import { createServiceSupabase } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

/** One-time or maintenance: create missing receipt rows for all donations. */
export async function POST(request: Request) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const supabase = createServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY or URL missing on server." },
      { status: 503 },
    );
  }

  const { data: donations, error } = await supabase.from("donations").select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  let created = 0;
  const errors: string[] = [];

  for (const row of donations ?? []) {
    try {
      await ensureDonationReceipt(supabase, row.id);
      created += 1;
    } catch (e) {
      errors.push(`${row.id}: ${e instanceof Error ? e.message : "failed"}`);
    }
  }

  return NextResponse.json({
    ok: true,
    processed: donations?.length ?? 0,
    ensured: created,
    errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
  });
}
