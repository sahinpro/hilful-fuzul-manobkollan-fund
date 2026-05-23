import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/admin/audit";
import { invalidatePublicFinanceCache } from "@/lib/cache/invalidate-public";
import { ensureDonationReceipt } from "@/lib/receipt/ensure-donation-receipt";
import { createServiceSupabase } from "@/lib/supabase/service";
import { donationUpdateBodySchema } from "@/lib/validation/admin";
import type { Database, Json } from "@/types/database";

type DonationUpdate = Database["public"]["Tables"]["donations"]["Update"];

export const dynamic = "force-dynamic";

const uuidParam = z.string().uuid();

const DONATION_SELECT =
  "id, donor_id, amount_bdt, payment_method, reference_note, received_at, is_published, created_at, donors (full_name, fathers_name, phone, email)";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const { id } = await context.params;
  const idParsed = uuidParam.safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid donation id." }, { status: 400 });
  }

  const supabase = createServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY or URL missing on server." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = donationUpdateBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const patch: DonationUpdate = {};

  if (data.donor_id !== undefined) {
    patch.donor_id = data.donor_id;
  }
  if (data.amount_bdt !== undefined) {
    patch.amount_bdt = data.amount_bdt.toFixed(2);
  }
  if (data.payment_method !== undefined) {
    patch.payment_method = data.payment_method;
  }
  if (data.reference_note !== undefined) {
    patch.reference_note = data.reference_note;
  }
  if (data.is_published !== undefined) {
    patch.is_published = data.is_published;
  }
  if (data.received_at !== undefined && data.received_at.trim() !== "") {
    patch.received_at = new Date(data.received_at).toISOString();
  }

  const { data: donation, error } = await supabase
    .from("donations")
    .update(patch)
    .eq("id", idParsed.data)
    .select(DONATION_SELECT)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!donation) {
    return NextResponse.json({ error: "Donation not found." }, { status: 404 });
  }

  let receiptNo: string | undefined;
  try {
    receiptNo = await ensureDonationReceipt(supabase, donation.id);
  } catch {
    receiptNo = undefined;
  }

  await writeAuditLog(supabase, {
    action: "donation.update",
    resource_type: "donation",
    resource_id: donation.id,
    diff: { ...(patch as object), receipt_no: receiptNo } as unknown as Json,
  });

  invalidatePublicFinanceCache();

  return NextResponse.json({ donation, receipt_no: receiptNo });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const { id } = await context.params;
  const idParsed = uuidParam.safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid donation id." }, { status: 400 });
  }

  const supabase = createServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY or URL missing on server." },
      { status: 503 },
    );
  }

  const donationId = idParsed.data;

  const { error: receiptErr } = await supabase
    .from("receipts")
    .delete()
    .eq("donation_id", donationId);

  if (receiptErr) {
    return NextResponse.json({ error: receiptErr.message }, { status: 400 });
  }

  const { data: removed, error } = await supabase
    .from("donations")
    .delete()
    .eq("id", donationId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!removed) {
    return NextResponse.json({ error: "Donation not found." }, { status: 404 });
  }

  await writeAuditLog(supabase, {
    action: "donation.delete",
    resource_type: "donation",
    resource_id: donationId,
    diff: null,
  });

  invalidatePublicFinanceCache();

  return NextResponse.json({ ok: true });
}
