import type { AdminLocale } from "@/lib/i18n/admin-locale";
import { adminDateLocaleTag } from "@/lib/i18n/admin-locale";
import { formatPublicBdt } from "@/lib/i18n/format-digits";

type DonorEmbed = {
  full_name: string;
  fathers_name?: string | null;
};

export type DonationExportRow = {
  amount_bdt: string;
  payment_method: string;
  reference_note: string | null;
  received_at: string;
  is_published: boolean;
  donors: DonorEmbed | DonorEmbed[] | null;
};

export type ExpenseExportRow = {
  category: string;
  amount_bdt: string;
  description: string;
  beneficiary_note: string | null;
  spent_at: string;
  is_published: boolean;
};

function donorFromRow(row: DonationExportRow): DonorEmbed | null {
  const rel = row.donors;
  if (rel == null) return null;
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

function formatDateTime(iso: string, locale: AdminLocale): string {
  return new Date(iso).toLocaleString(adminDateLocaleTag(locale), {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function sumBdtAmounts(rows: { amount_bdt: string }[]): number {
  return rows.reduce((sum, row) => {
    const n = Number(row.amount_bdt);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
}

export function donationRowsForExport(
  rows: DonationExportRow[],
  locale: AdminLocale,
): string[][] {
  return rows.map((row) => {
    const donor = donorFromRow(row);
    return [
      donor?.full_name?.trim() || "—",
      donor?.fathers_name?.trim() || "—",
      formatPublicBdt(Number(row.amount_bdt) || 0, locale === "bn" ? "bn" : "en"),
      row.payment_method,
      row.reference_note?.trim() || "—",
      formatDateTime(row.received_at, locale),
    ];
  });
}

export function expenseRowsForExport(
  rows: ExpenseExportRow[],
  locale: AdminLocale,
): string[][] {
  return rows.map((row) => [
    row.category,
    formatPublicBdt(Number(row.amount_bdt) || 0, locale === "bn" ? "bn" : "en"),
    row.description,
    row.beneficiary_note?.trim() || "—",
    formatDateTime(row.spent_at, locale),
  ]);
}
