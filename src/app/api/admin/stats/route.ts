import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { createServiceSupabase } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

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

  const [donations, expenses, donors, donationAmounts, expenseAmounts] = await Promise.all([
    supabase.from("donations").select("id", { count: "exact", head: true }),
    supabase.from("expenses").select("id", { count: "exact", head: true }),
    supabase.from("donors").select("id", { count: "exact", head: true }),
    supabase.from("donations").select("amount_bdt").limit(10_000),
    supabase.from("expenses").select("amount_bdt").limit(10_000),
  ]);

  if (donations.error) {
    return NextResponse.json({ error: donations.error.message }, { status: 400 });
  }
  if (expenses.error) {
    return NextResponse.json({ error: expenses.error.message }, { status: 400 });
  }
  if (donors.error) {
    return NextResponse.json({ error: donors.error.message }, { status: 400 });
  }
  if (donationAmounts.error) {
    return NextResponse.json({ error: donationAmounts.error.message }, { status: 400 });
  }
  if (expenseAmounts.error) {
    return NextResponse.json({ error: expenseAmounts.error.message }, { status: 400 });
  }

  const sumRows = (rows: { amount_bdt: string }[] | null) =>
    (rows ?? []).reduce((acc, r) => acc + Number(r.amount_bdt), 0);

  const totalDonationBdt = sumRows(donationAmounts.data);
  const totalExpenseBdt = sumRows(expenseAmounts.data);

  return NextResponse.json({
    counts: {
      donations: donations.count ?? 0,
      expenses: expenses.count ?? 0,
      donors: donors.count ?? 0,
    },
    totals: {
      donation_bdt: totalDonationBdt,
      expense_bdt: totalExpenseBdt,
      net_bdt: totalDonationBdt - totalExpenseBdt,
    },
    totalsCapped:
      (donationAmounts.data?.length ?? 0) >= 10_000 ||
      (expenseAmounts.data?.length ?? 0) >= 10_000,
  });
}
