import { deriveReceiptNo } from "@/lib/receipt/receipt-number";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

type ServiceSupabase = SupabaseClient<Database>;

/**
 * Guarantees a canonical receipt row exists for a donation (service role).
 * Prefers DB RPC `ensure_donation_receipt`; falls back to app upsert.
 */
export async function ensureDonationReceipt(
  supabase: ServiceSupabase,
  donationId: string,
): Promise<string> {
  const { data: rpcNo, error: rpcErr } = await supabase.rpc("ensure_donation_receipt", {
    p_donation_id: donationId,
  });

  if (!rpcErr && typeof rpcNo === "string" && rpcNo.trim()) {
    return rpcNo.trim();
  }

  const receiptNo = deriveReceiptNo(donationId);
  const { error: upsertErr } = await supabase.from("receipts").upsert(
    {
      donation_id: donationId,
      receipt_no: receiptNo,
      extra_payload: {},
    },
    { onConflict: "donation_id" },
  );

  if (upsertErr) {
    throw new Error(upsertErr.message);
  }

  return receiptNo;
}
