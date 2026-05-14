import type { AdminLocale } from "@/lib/i18n/admin-locale";

const BN_TAG = "bn-BD";
const EN_TAG = "en-GB";

export type PublicLocale = "bn" | "en";

function numberFormatTagForAdmin(locale: AdminLocale): string {
  return locale === "bn" ? BN_TAG : EN_TAG;
}

function numberFormatTagForPublic(locale: PublicLocale): string {
  return locale === "bn" ? BN_TAG : EN_TAG;
}

/**
 * Formats a BDT amount for admin tables and summaries (no currency symbol).
 * Uses Bengali numerals when admin locale is Bangla (`bn-BD`).
 */
export function formatAdminBdtAmount(
  value: string | number,
  locale: AdminLocale,
  opts?: { minimumFractionDigits?: number; maximumFractionDigits?: number },
): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) {
    return typeof value === "string" ? value : String(value);
  }
  const min = opts?.minimumFractionDigits ?? 2;
  const max = opts?.maximumFractionDigits ?? 2;
  return new Intl.NumberFormat(numberFormatTagForAdmin(locale), {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  }).format(n);
}

/** Integer counts in admin (e.g. donor counts). */
export function formatAdminInteger(value: number, locale: AdminLocale): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat(numberFormatTagForAdmin(locale), {
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Public monetary display: `৳` + formatted amount.
 * `bn` uses Bengali digits; `en` uses Western digits with en-GB grouping.
 */
export function formatPublicBdt(amount: number, locale: PublicLocale = "bn"): string {
  const n = new Intl.NumberFormat(numberFormatTagForPublic(locale), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `৳ ${n}`;
}
