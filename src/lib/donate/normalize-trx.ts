/** Normalize MFS transaction id for storage and duplicate checks. */
export function normalizeTrxId(raw: string): string {
  return raw.trim().replace(/\s+/g, "").toUpperCase();
}

export function isValidTrxId(normalized: string): boolean {
  if (normalized.length < 4 || normalized.length > 32) return false;
  return /^[A-Z0-9]+$/.test(normalized);
}
