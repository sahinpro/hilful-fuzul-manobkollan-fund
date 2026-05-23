/** Minimum characters for prefix autocomplete (DB-enforced too). */
export const RECEIPT_PREFIX_SEARCH_MIN = 4;

/** Minimum characters for exact verify submit. */
export const RECEIPT_EXACT_MIN = 2;

export const RECEIPT_QUERY_MAX = 64;

/** Canonical receipt number for a donation (must match DB `generate_receipt_no`). */
export function deriveReceiptNo(donationId: string, storedReceiptNo?: string | null): string {
  const stored = storedReceiptNo?.trim();
  if (stored) return stored;
  return `HF-${donationId.replace(/-/g, "").slice(0, 12).toUpperCase()}`;
}

export function normalizeReceiptQuery(raw: string): string {
  return raw.trim().replace(/\s+/g, "");
}

export function isReceiptExactQueryValid(raw: string): boolean {
  const q = normalizeReceiptQuery(raw);
  return q.length >= RECEIPT_EXACT_MIN && q.length <= RECEIPT_QUERY_MAX;
}

export function isReceiptPrefixSearchValid(raw: string): boolean {
  const q = normalizeReceiptQuery(raw);
  return q.length >= RECEIPT_PREFIX_SEARCH_MIN && q.length <= RECEIPT_QUERY_MAX;
}

/** @deprecated Use isReceiptExactQueryValid or isReceiptPrefixSearchValid */
export function isReceiptQueryValid(raw: string): boolean {
  return isReceiptExactQueryValid(raw);
}
