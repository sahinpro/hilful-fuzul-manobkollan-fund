import {
  isReceiptExactQueryValid,
  isReceiptPrefixSearchValid,
  normalizeReceiptQuery,
} from "@/lib/receipt/receipt-number";
import { createPublicReceiptSupabase, isPublicReceiptSupabaseConfigured } from "@/lib/supabase/public-receipt";

export type PublicReceiptRecord = {
  receiptNo: string;
  donationId: string;
  amountBdt: string;
  paymentMethod: string;
  receivedAt: string;
  donorName: string;
  donorFathersName: string | null;
};

function parseRecord(raw: unknown): PublicReceiptRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const receiptNo = typeof o.receiptNo === "string" ? o.receiptNo : null;
  const donationId = typeof o.donationId === "string" ? o.donationId : null;
  if (!receiptNo || !donationId) return null;

  return {
    receiptNo,
    donationId,
    amountBdt: String(o.amountBdt ?? ""),
    paymentMethod: String(o.paymentMethod ?? ""),
    receivedAt:
      typeof o.receivedAt === "string"
        ? o.receivedAt
        : o.receivedAt instanceof Date
          ? o.receivedAt.toISOString()
          : String(o.receivedAt ?? ""),
    donorName: String(o.donorName ?? "—"),
    donorFathersName:
      o.donorFathersName === null || o.donorFathersName === undefined
        ? null
        : String(o.donorFathersName),
  };
}

function parseRecordList(raw: unknown): PublicReceiptRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(parseRecord).filter((r): r is PublicReceiptRecord => r != null);
}

function rpcUnavailable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const msg = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST202" ||
    error.code === "42883" ||
    msg.includes("function") ||
    msg.includes("does not exist")
  );
}

/** Exact lookup via `public_receipt_lookup_exact` (published donations only). */
export async function lookupPublicReceipt(
  receiptNoInput: string,
): Promise<PublicReceiptRecord | null> {
  const q = normalizeReceiptQuery(receiptNoInput);
  if (!isReceiptExactQueryValid(q)) return null;

  const supabase = createPublicReceiptSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("public_receipt_lookup_exact", {
    p_receipt_no: q,
  });

  if (error) {
    if (rpcUnavailable(error)) return null;
    throw new Error(error.message);
  }

  return parseRecord(data);
}

export type SearchPublicReceiptsParams = {
  query: string;
  paymentMethod?: string;
  limit?: number;
};

/** Prefix search via `public_receipt_search_prefix` (min 4 chars, published only). */
export async function searchPublicReceipts(
  params: SearchPublicReceiptsParams,
): Promise<PublicReceiptRecord[]> {
  const q = normalizeReceiptQuery(params.query);
  if (!isReceiptPrefixSearchValid(q)) return [];

  const supabase = createPublicReceiptSupabase();
  if (!supabase) return [];

  const limit = Math.min(30, Math.max(1, params.limit ?? 15));
  const payment =
    params.paymentMethod && params.paymentMethod !== "all"
      ? params.paymentMethod
      : null;

  const { data, error } = await supabase.rpc("public_receipt_search_prefix", {
    p_prefix: q,
    p_payment_method: payment,
    p_limit: limit,
  });

  if (error) {
    if (rpcUnavailable(error)) return [];
    throw new Error(error.message);
  }

  if (typeof data === "string") {
    try {
      return parseRecordList(JSON.parse(data));
    } catch {
      return [];
    }
  }

  return parseRecordList(data);
}

export function isPublicReceiptLookupConfigured(): boolean {
  return isPublicReceiptSupabaseConfigured();
}
