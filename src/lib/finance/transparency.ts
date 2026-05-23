import {
  getCachedPublishedExpenseByCategory,
  getCachedTransparencyLedger,
  getCachedTransparencyTotals,
} from "@/lib/cache/public-data";
import type { ExpenseCategoryBreakdown } from "@/lib/finance/public-charts";
import { formatPublicBdt } from "@/lib/i18n/format-digits";
import { isPublicReadSupabaseConfigured } from "@/lib/supabase/public-read";
import type { Database } from "@/types/database";

export type TransparencyTotals = {
  totalDonations: number;
  totalExpenses: number;
  balance: number;
};

export type LedgerRow = Database["public"]["Views"]["transparency_ledger"]["Row"];

export function formatBdtBn(amount: number): string {
  return formatPublicBdt(amount, "bn");
}

export function isSupabaseConfigured(): boolean {
  return isPublicReadSupabaseConfigured();
}

export async function fetchTransparencyTotals(): Promise<TransparencyTotals | null> {
  return getCachedTransparencyTotals();
}

export async function fetchTransparencyLedger(limit = 200): Promise<LedgerRow[]> {
  return getCachedTransparencyLedger(limit);
}

export async function fetchPublishedExpenseByCategory(): Promise<ExpenseCategoryBreakdown | null> {
  return getCachedPublishedExpenseByCategory();
}
