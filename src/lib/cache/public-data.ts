import { unstable_cache } from "next/cache";
import { cache } from "react";
import { PUBLIC_CACHE_TAGS } from "@/lib/cache/tags";
import type { TransparencyTotals, LedgerRow } from "@/lib/finance/transparency";
import type { LeadershipMember } from "@/lib/site/leadership";
import { createPublicReadSupabase, isPublicReadSupabaseConfigured } from "@/lib/supabase/public-read";

const TRANSPARENCY_REVALIDATE_SEC = 120;
const LEADERSHIP_REVALIDATE_SEC = 600;
const LEDGER_DEFAULT_LIMIT = 200;

function parseMoney(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

async function loadTransparencyTotals(): Promise<TransparencyTotals | null> {
  if (!isPublicReadSupabaseConfigured()) return null;

  const supabase = createPublicReadSupabase();
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

async function loadTransparencyLedger(limit: number): Promise<LedgerRow[]> {
  if (!isPublicReadSupabaseConfigured()) return [];

  const supabase = createPublicReadSupabase();
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

async function loadLeadershipMembers(): Promise<LeadershipMember[]> {
  if (!isPublicReadSupabaseConfigured()) return [];

  const supabase = createPublicReadSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("leadership_members")
    .select("id, category, full_name, fathers_name, designation, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
}

const getTransparencyTotalsCached = unstable_cache(
  loadTransparencyTotals,
  ["public", "transparency-totals"],
  {
    revalidate: TRANSPARENCY_REVALIDATE_SEC,
    tags: [PUBLIC_CACHE_TAGS.transparencyTotals],
  },
);

const getTransparencyLedgerCached = unstable_cache(
  async (limit: number) => loadTransparencyLedger(limit),
  ["public", "transparency-ledger"],
  {
    revalidate: TRANSPARENCY_REVALIDATE_SEC,
    tags: [PUBLIC_CACHE_TAGS.transparencyLedger],
  },
);

const getLeadershipMembersCached = unstable_cache(
  loadLeadershipMembers,
  ["public", "leadership-members"],
  {
    revalidate: LEADERSHIP_REVALIDATE_SEC,
    tags: [PUBLIC_CACHE_TAGS.leadership],
  },
);

/** Per-request dedupe + cross-request Data Cache (tagged, revalidated on admin writes). */
export const getCachedTransparencyTotals = cache(getTransparencyTotalsCached);

export const getCachedTransparencyLedger = cache((limit = LEDGER_DEFAULT_LIMIT) =>
  getTransparencyLedgerCached(limit),
);

export const getCachedLeadershipMembers = cache(getLeadershipMembersCached);
