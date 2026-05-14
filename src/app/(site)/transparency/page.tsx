import { HandCoins, Landmark, ScrollText } from "lucide-react";
import { FundOverviewCharts } from "@/components/fund-overview-charts";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchTransparencyLedger,
  fetchTransparencyTotals,
  type LedgerRow,
} from "@/lib/finance/transparency";
import { formatPublicBdt, type PublicLocale } from "@/lib/i18n/format-digits";
import { getSiteTranslator } from "@/lib/i18n/site-server";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function formatOccurredAt(iso: string, locale: PublicLocale): string {
  const tag = locale === "en" ? "en-GB" : "bn-BD";
  try {
    return new Date(iso).toLocaleDateString(tag, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function kindLabel(kind: string, t: (key: string) => string): string {
  if (kind === "donation") return t("pages.transparency.kind.donation");
  if (kind === "expense") return t("pages.transparency.kind.expense");
  return kind;
}

function ledgerAmount(row: LedgerRow, locale: PublicLocale): { text: string; className: string } {
  const inn = row.amount_in != null ? Number(row.amount_in) : 0;
  const out = row.amount_out != null ? Number(row.amount_out) : 0;
  if (row.kind === "donation" && inn > 0) {
    return {
      text: `+ ${formatPublicBdt(inn, locale)}`,
      className: "text-emerald-600 dark:text-emerald-400",
    };
  }
  if (row.kind === "expense" && out > 0) {
    return {
      text: `− ${formatPublicBdt(out, locale)}`,
      className: "text-rose-600 dark:text-rose-400",
    };
  }
  return { text: "—", className: "text-muted-foreground" };
}

export default async function TransparencyPage() {
  const { locale, t } = await getSiteTranslator();
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
    ? t("pages.transparency.statsNote.noEnv")
    : showLiveTotals
      ? t("pages.transparency.statsNote.live")
      : t("pages.transparency.statsNote.error");

  const ledgerNote = !configured
    ? t("pages.transparency.ledgerNote.noEnv")
    : ledger.length === 0
      ? t("pages.transparency.ledgerNote.empty")
      : null;

  return (
    <PageShell
      icon={ScrollText}
      title={t("pages.transparency.title")}
      subtitle={t("pages.transparency.subtitle")}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("pages.transparency.stats.donationsTitle")}
            </CardTitle>
            <HandCoins className="h-5 w-5 text-primary" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatPublicBdt(donationTotal, locale)}</p>
            <CardDescription className="mt-1">{statsNote}</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("pages.transparency.stats.expensesTitle")}
            </CardTitle>
            <ScrollText className="h-5 w-5 text-primary" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatPublicBdt(expenseTotal, locale)}</p>
            <CardDescription className="mt-1">
              {t("pages.transparency.stats.expensesCardNote")}
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("pages.transparency.stats.balanceTitle")}
            </CardTitle>
            <Landmark className="h-5 w-5 text-primary" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatPublicBdt(balance, locale)}</p>
            <CardDescription className="mt-1">
              {t("pages.transparency.stats.balanceCardNote")}
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <FundOverviewCharts />

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("pages.transparency.table.date")}</th>
              <th className="px-4 py-3 font-semibold">{t("pages.transparency.table.kind")}</th>
              <th className="px-4 py-3 font-semibold">
                {t("pages.transparency.table.description")}
              </th>
              <th className="px-4 py-3 font-semibold">{t("pages.transparency.table.amount")}</th>
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
                const amt = ledgerAmount(row, locale);
                return (
                  <tr key={`${row.kind}-${row.id}`} className="border-t border-border">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatOccurredAt(row.occurred_at, locale)}
                    </td>
                    <td className="px-4 py-3">{kindLabel(row.kind, t)}</td>
                    <td className="px-4 py-3">{row.description?.trim() || "—"}</td>
                    <td className={`px-4 py-3 font-medium tabular-nums ${amt.className}`}>
                      {amt.text}
                    </td>
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
