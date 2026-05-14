import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { createServiceSupabase } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

function dayKeyUtc(d: Date): string {
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayKeyFromIso(iso: string): string {
  return dayKeyUtc(new Date(iso));
}

export async function GET(request: Request) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const supabase = createServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY or URL missing on server." },
      { status: 503 },
    );
  }

  const rawDays = Number(new URL(request.url).searchParams.get("days"));
  const days = Number.isFinite(rawDays) ? Math.min(120, Math.max(7, rawDays)) : 30;

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  since.setUTCHours(0, 0, 0, 0);
  const sinceIso = since.toISOString();

  const [donRes, expRes] = await Promise.all([
    supabase.from("donations").select("received_at, amount_bdt").gte("received_at", sinceIso).limit(20_000),
    supabase.from("expenses").select("spent_at, amount_bdt").gte("spent_at", sinceIso).limit(20_000),
  ]);

  if (donRes.error) {
    return NextResponse.json({ error: donRes.error.message }, { status: 400 });
  }
  if (expRes.error) {
    return NextResponse.json({ error: expRes.error.message }, { status: 400 });
  }

  const byDay = new Map<string, { donations: number; expenses: number }>();

  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    const key = dayKeyUtc(d);
    byDay.set(key, { donations: 0, expenses: 0 });
  }

  for (const row of donRes.data ?? []) {
    const key = dayKeyFromIso(row.received_at);
    if (!key || !byDay.has(key)) continue;
    const cur = byDay.get(key)!;
    cur.donations += Number(row.amount_bdt);
    byDay.set(key, cur);
  }

  for (const row of expRes.data ?? []) {
    const key = dayKeyFromIso(row.spent_at);
    if (!key || !byDay.has(key)) continue;
    const cur = byDay.get(key)!;
    cur.expenses += Number(row.amount_bdt);
    byDay.set(key, cur);
  }

  const points = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      date,
      donations: Math.round(v.donations * 100) / 100,
      expenses: Math.round(v.expenses * 100) / 100,
    }));

  return NextResponse.json({
    days,
    points,
    capped: (donRes.data?.length ?? 0) >= 20_000 || (expRes.data?.length ?? 0) >= 20_000,
  });
}
