import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/admin/audit";
import { invalidatePublicFinanceCache } from "@/lib/cache/invalidate-public";
import { ensureDonationReceipt } from "@/lib/receipt/ensure-donation-receipt";
import { createServiceSupabase } from "@/lib/supabase/service";
import { donationCreateBodySchema } from "@/lib/validation/admin";

export const dynamic = "force-dynamic";

const DONATION_LIST_COLUMNS =
  "id, donor_id, amount_bdt, payment_method, reference_note, received_at, is_published, created_at, donors (full_name, fathers_name, phone, email)";

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

  const limit = Math.min(
    500,
    Math.max(1, Number(new URL(request.url).searchParams.get("limit")) || 200),
  );

  const { data: donations, error } = await supabase
    .from("donations")
    .select(DONATION_LIST_COLUMNS)
    .order("received_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ donations: donations ?? [] });
}

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = donationCreateBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  let donorId: string | null = data.donor_id ?? null;

  if (data.donor) {
    const { data: donorRow, error: donorErr } = await supabase
      .from("donors")
      .insert({
        full_name: data.donor.full_name,
        fathers_name: data.donor.fathers_name?.trim()
          ? data.donor.fathers_name.trim()
          : null,
        phone: data.donor.phone ?? null,
        email: data.donor.email ?? null,
        notes: data.donor.notes ?? null,
      })
      .select("id")
      .single();

    if (donorErr) {
      return NextResponse.json({ error: donorErr.message }, { status: 400 });
    }
    donorId = donorRow.id;
  }

  const receivedAt =
    data.received_at && data.received_at.trim() !== ""
      ? new Date(data.received_at).toISOString()
      : new Date().toISOString();

  const insertRow = {
    donor_id: donorId,
    amount_bdt: data.amount_bdt.toFixed(2),
    payment_method: data.payment_method,
    reference_note: data.reference_note ?? null,
    is_published: data.is_published,
    received_at: receivedAt,
  };

  const { data: donation, error } = await supabase
    .from("donations")
    .insert(insertRow)
    .select("id, donor_id, amount_bdt, payment_method, received_at, is_published")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  let receiptNo: string | undefined;
  try {
    receiptNo = await ensureDonationReceipt(supabase, donation.id);
  } catch {
    receiptNo = undefined;
  }

  await writeAuditLog(supabase, {
    action: "donation.create",
    resource_type: "donation",
    resource_id: donation.id,
    diff: {
      amount_bdt: donation.amount_bdt,
      payment_method: donation.payment_method,
      receipt_no: receiptNo,
    },
  });

  invalidatePublicFinanceCache();

  return NextResponse.json({ donation, receipt_no: receiptNo }, { status: 201 });
}
