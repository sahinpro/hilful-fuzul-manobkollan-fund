import { HandCoins, Landmark, ScrollText } from "lucide-react";
import { FundOverviewCharts } from "@/components/fund-overview-charts";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchTransparencyLedger,
  fetchTransparencyTotals,
  formatBdtBn,
  type LedgerRow,
} from "@/lib/finance/transparency";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function kindLabel(kind: string): string {
  if (kind === "donation") return "দান";
  if (kind === "expense") return "ব্যয়";
  return kind;
}

function formatOccurredAt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function ledgerAmount(row: LedgerRow): { text: string; className: string } {
  const inn = row.amount_in != null ? Number(row.amount_in) : 0;
  const out = row.amount_out != null ? Number(row.amount_out) : 0;
  if (row.kind === "donation" && inn > 0) {
    return { text: `+ ${formatBdtBn(inn)}`, className: "text-emerald-600 dark:text-emerald-400" };
  }
  if (row.kind === "expense" && out > 0) {
    return { text: `− ${formatBdtBn(out)}`, className: "text-rose-600 dark:text-rose-400" };
  }
  return { text: "—", className: "text-muted-foreground" };
}

export default async function TransparencyPage() {
  const configured = isSupabaseConfigured();
  const [totals, ledger] = await Promise.all([
    fetchTransparencyTotals(),
    fetchTransparencyLedger(200),
  ]);

  const showLiveTotals = totals != null;
  const donationTotal = totals?.totalDonations ?? 0;
  const expenseTotal = totals?.totalExpenses ?? 0;
  const balance = totals?.balance ?? 0;

  const statsNote = !configured
    ? "Supabase সংযোগ (.env.local) যোগ করলে লাইভ মোট দেখাবে।"
    : showLiveTotals
      ? "শুধু প্রকাশিত (is_published) এন্ট্রি থেকে গণনা।"
      : "মোট লোড করা যায়নি — টেবিল/আরপিসি মাইগ্রেশন চালু আছে কিনা যাচাই করুন।";

  const ledgerNote = !configured
    ? "লাইভ ডাটা সংযুক্ত হলে এন্ট্রি দেখা যাবে।"
    : ledger.length === 0
      ? "এখনও কোনো প্রকাশিত দান বা ব্যয় এন্ট্রি নেই।"
      : null;

  return (
    <PageShell
      icon={ScrollText}
      title="স্বচ্ছতা"
      subtitle="জনসাধারণের জন্য দান ও ব্যয়ের পূর্ণাঙ্গ হিসাব এই অংশে প্রকাশ করা হবে।"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">মোট দান</CardTitle>
            <HandCoins className="h-5 w-5 text-primary" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatBdtBn(donationTotal)}</p>
            <CardDescription className="mt-1">{statsNote}</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">মোট ব্যয়</CardTitle>
            <ScrollText className="h-5 w-5 text-primary" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatBdtBn(expenseTotal)}</p>
            <CardDescription className="mt-1">
              খাতভিত্তিক বিভাজন চার্টে (নমুনা/পরবর্তীতে লাইভ)।
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">তহবিল অবশিষ্ট</CardTitle>
            <Landmark className="h-5 w-5 text-primary" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatBdtBn(balance)}</p>
            <CardDescription className="mt-1">লেজার ভিত্তিক ব্যালেন্স (প্রকাশিত এন্ট্রি)।</CardDescription>
          </CardContent>
        </Card>
      </div>

      <FundOverviewCharts />

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">তারিখ</th>
              <th className="px-4 py-3 font-semibold">ধরণ</th>
              <th className="px-4 py-3 font-semibold">বিবরণ</th>
              <th className="px-4 py-3 font-semibold">পরিমাণ</th>
            </tr>
          </thead>
          <tbody>
            {ledger.length === 0 ? (
              <tr className="border-t border-border">
                <td className="px-4 py-3 text-muted-foreground" colSpan={4}>
                  {ledgerNote ?? "—"}
                </td>
              </tr>
            ) : (
              ledger.map((row) => {
                const amt = ledgerAmount(row);
                return (
                  <tr key={`${row.kind}-${row.id}`} className="border-t border-border">
                    <td className="px-4 py-3 whitespace-nowrap">{formatOccurredAt(row.occurred_at)}</td>
                    <td className="px-4 py-3">{kindLabel(row.kind)}</td>
                    <td className="px-4 py-3">{row.description?.trim() || "—"}</td>
                    <td className={`px-4 py-3 font-medium tabular-nums ${amt.className}`}>{amt.text}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
