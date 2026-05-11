import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type TransparencyTotals = {
  totalDonations: number;
  totalExpenses: number;
  balance: number;
};

export type LedgerRow = Database["public"]["Views"]["transparency_ledger"]["Row"];

export function formatBdtBn(amount: number): string {
  const n = new Intl.NumberFormat("bn-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `৳ ${n}`;
}

function parseMoney(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function fetchTransparencyTotals(): Promise<TransparencyTotals | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("transparency_sums");
  if (error) {
    console.error(error);
    return null;
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return { totalDonations: 0, totalExpenses: 0, balance: 0 };
  }

  const totalDonations = parseMoney(row.total_donations as unknown as string);
  const totalExpenses = parseMoney(row.total_expenses as unknown as string);
  return {
    totalDonations,
    totalExpenses,
    balance: totalDonations - totalExpenses,
  };
}

export async function fetchTransparencyLedger(limit = 200): Promise<LedgerRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createServerSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("transparency_ledger")
    .select("id, kind, occurred_at, description, amount_in, amount_out")
    .order("occurred_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
}
