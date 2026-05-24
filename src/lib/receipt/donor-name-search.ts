import { RECEIPT_PREFIX_SEARCH_MIN } from "@/lib/receipt/receipt-number";

/** Minimum characters for donor name autocomplete (DB-enforced too). */
export const DONOR_NAME_SEARCH_MIN = 3;

export const DONOR_NAME_QUERY_MAX = 80;

export function normalizeDonorNameQuery(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export function isDonorNameSearchValid(raw: string): boolean {
  const q = normalizeDonorNameQuery(raw);
  return q.length >= DONOR_NAME_SEARCH_MIN && q.length <= DONOR_NAME_QUERY_MAX;
}

/** True when the query should use receipt-number search (HF-… prefix). */
export function looksLikeReceiptQuery(raw: string): boolean {
  const compact = raw.trim().replace(/\s+/g, "");
  if (!compact) return false;
  return /^HF-?[A-F0-9]*$/i.test(compact);
}

export type ReceiptSearchKind = "receipt" | "donor";

/** Resolves which public search to run for a combined lookup field. */
export function resolveReceiptSearchKind(raw: string): ReceiptSearchKind | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (looksLikeReceiptQuery(trimmed)) {
    const compact = trimmed.replace(/\s+/g, "");
    if (compact.length >= RECEIPT_PREFIX_SEARCH_MIN) return "receipt";
    return null;
  }

  return isDonorNameSearchValid(trimmed) ? "donor" : null;
}
