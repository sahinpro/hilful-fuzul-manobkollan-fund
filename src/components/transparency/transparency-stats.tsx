import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  fetchTransparencyTotals,
  isSupabaseConfigured,
} from "@/lib/finance/transparency";
import { formatPublicBdt } from "@/lib/i18n/format-digits";
import { getSiteTranslator } from "@/lib/i18n/site-server";
import { HandCoins, Landmark, ScrollText } from "lucide-react";

export async function TransparencyStats() {
  const { locale, t } = await getSiteTranslator();
  const configured = isSupabaseConfigured();
  const totals = await fetchTransparencyTotals();

  const showLiveTotals = totals != null;
  const donationTotal = totals?.totalDonations ?? 0;
  const expenseTotal = totals?.totalExpenses ?? 0;
  const balance = totals?.balance ?? 0;

  const statsNote = !configured
    ? t("pages.transparency.statsNote.noEnv")
    : showLiveTotals
      ? t("pages.transparency.statsNote.live")
      : t("pages.transparency.statsNote.error");

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="ios-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("pages.transparency.stats.donationsTitle")}
          </CardTitle>
          <HandCoins className="size-5 text-primary" aria-hidden />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatPublicBdt(donationTotal, locale)}</p>
          <CardDescription className="mt-1">{statsNote}</CardDescription>
        </CardContent>
      </Card>
      <Card className="ios-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("pages.transparency.stats.expensesTitle")}
          </CardTitle>
          <ScrollText className="size-5 text-primary" aria-hidden />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatPublicBdt(expenseTotal, locale)}</p>
          <CardDescription className="mt-1">
            {t("pages.transparency.stats.expensesCardNote")}
          </CardDescription>
        </CardContent>
      </Card>
      <Card className="ios-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("pages.transparency.stats.balanceTitle")}
          </CardTitle>
          <Landmark className="size-5 text-primary" aria-hidden />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatPublicBdt(balance, locale)}</p>
          <CardDescription className="mt-1">
            {t("pages.transparency.stats.balanceCardNote")}
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
