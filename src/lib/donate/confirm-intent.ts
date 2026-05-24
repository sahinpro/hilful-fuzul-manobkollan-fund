import { writeAuditLog } from "@/lib/admin/audit";
import { invalidatePublicFinanceCache } from "@/lib/cache/invalidate-public";
import { normalizeTrxId } from "@/lib/donate/normalize-trx";
import { ensureDonationReceipt } from "@/lib/receipt/ensure-donation-receipt";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

type ServiceSupabase = SupabaseClient<Database>;

export type DonationIntentRow = Database["public"]["Tables"]["donation_intents"]["Row"];

export class ConfirmIntentError extends Error {
  constructor(
    message: string,
    readonly code:
      | "NOT_FOUND"
      | "NOT_PENDING"
      | "EXPIRED"
      | "TRX_ALREADY_USED"
      | "DB_ERROR",
  ) {
    super(message);
    this.name = "ConfirmIntentError";
  }
}

export type ConfirmIntentResult = {
  donationId: string;
  receiptNo: string;
};

export async function confirmDonationIntent(
  supabase: ServiceSupabase,
  intentId: string,
): Promise<ConfirmIntentResult> {
  const { data: intent, error: fetchErr } = await supabase
    .from("donation_intents")
    .select("*")
    .eq("id", intentId)
    .maybeSingle();

  if (fetchErr) {
    throw new ConfirmIntentError(fetchErr.message, "DB_ERROR");
  }
  if (!intent) {
    throw new ConfirmIntentError("Donation request not found.", "NOT_FOUND");
  }

  if (intent.status === "confirmed" && intent.donation_id) {
    const receiptNo = await ensureDonationReceipt(supabase, intent.donation_id);
    return { donationId: intent.donation_id, receiptNo };
  }

  if (intent.status !== "pending") {
    throw new ConfirmIntentError(`Request is already ${intent.status}.`, "NOT_PENDING");
  }

  if (new Date(intent.expires_at).getTime() < Date.now()) {
    await supabase
      .from("donation_intents")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("id", intentId);
    throw new ConfirmIntentError("Request has expired.", "EXPIRED");
  }

  const trxId = normalizeTrxId(intent.trx_id);

  const { data: existingDonation } = await supabase
    .from("donations")
    .select("id")
    .eq("payment_method", intent.payment_method)
    .eq("trx_id", trxId)
    .maybeSingle();

  if (existingDonation) {
    throw new ConfirmIntentError(
      "This transaction id is already recorded as a donation.",
      "TRX_ALREADY_USED",
    );
  }

  const { data: donorRow, error: donorErr } = await supabase
    .from("donors")
    .insert({
      full_name: intent.donor_full_name.trim(),
      fathers_name: intent.donor_fathers_name?.trim() || null,
      phone: null,
      email: null,
      notes: `Online semi-auto (${intent.source})`,
    })
    .select("id")
    .single();

  if (donorErr) {
    throw new ConfirmIntentError(donorErr.message, "DB_ERROR");
  }

  const receivedAt = new Date().toISOString();
  const amountStr = Number(intent.amount_bdt).toFixed(2);

  const { data: donation, error: donationErr } = await supabase
    .from("donations")
    .insert({
      donor_id: donorRow.id,
      amount_bdt: amountStr,
      payment_method: intent.payment_method,
      reference_note: null,
      trx_id: trxId,
      intent_id: intent.id,
      received_at: receivedAt,
      is_published: true,
    })
    .select("id")
    .single();

  if (donationErr) {
    throw new ConfirmIntentError(donationErr.message, "DB_ERROR");
  }

  const receiptNo = await ensureDonationReceipt(supabase, donation.id);

  const { error: intentUpdateErr } = await supabase
    .from("donation_intents")
    .update({
      status: "confirmed",
      donation_id: donation.id,
      confirmed_at: receivedAt,
      updated_at: receivedAt,
    })
    .eq("id", intentId);

  if (intentUpdateErr) {
    throw new ConfirmIntentError(intentUpdateErr.message, "DB_ERROR");
  }

  await writeAuditLog(supabase, {
    action: "donation_intent.confirm",
    resource_type: "donation_intent",
    resource_id: intentId,
    diff: {
      donation_id: donation.id,
      receipt_no: receiptNo,
      amount_bdt: amountStr,
      payment_method: intent.payment_method,
      trx_id: trxId,
    },
  });

  invalidatePublicFinanceCache();

  return { donationId: donation.id, receiptNo };
}

export async function rejectDonationIntent(
  supabase: ServiceSupabase,
  intentId: string,
): Promise<void> {
  const { data: intent, error: fetchErr } = await supabase
    .from("donation_intents")
    .select("id, status")
    .eq("id", intentId)
    .maybeSingle();

  if (fetchErr) {
    throw new ConfirmIntentError(fetchErr.message, "DB_ERROR");
  }
  if (!intent) {
    throw new ConfirmIntentError("Donation request not found.", "NOT_FOUND");
  }
  if (intent.status !== "pending") {
    throw new ConfirmIntentError(`Request is already ${intent.status}.`, "NOT_PENDING");
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("donation_intents")
    .update({ status: "rejected", updated_at: now })
    .eq("id", intentId);

  if (error) {
    throw new ConfirmIntentError(error.message, "DB_ERROR");
  }

  await writeAuditLog(supabase, {
    action: "donation_intent.reject",
    resource_type: "donation_intent",
    resource_id: intentId,
    diff: {},
  });
}
