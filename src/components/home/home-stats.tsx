import { StatCard } from "@/components/stat-card";
import {
  fetchTransparencyTotals,
  isSupabaseConfigured,
} from "@/lib/finance/transparency";
import { formatPublicBdt } from "@/lib/i18n/format-digits";
import { getSiteTranslator } from "@/lib/i18n/site-server";
import { HandHeart, Landmark, Scale } from "lucide-react";

export async function HomeStats() {
  const { locale, t } = await getSiteTranslator();
  const configured = isSupabaseConfigured();
  const totals = await fetchTransparencyTotals();

  const donationTotal = totals?.totalDonations ?? 0;
  const expenseTotal = totals?.totalExpenses ?? 0;
  const balance = totals?.balance ?? 0;

  const donationsNote = !configured
    ? t("home.stats.donationsNoteNoEnv")
    : totals != null
      ? t("home.stats.donationsNoteLive")
      : t("home.stats.donationsNoteError");

  const expensesNote = !configured
    ? t("home.stats.expensesNoteNoEnv")
    : totals != null
      ? t("home.stats.expensesNoteLive")
      : t("home.stats.expensesNoteError");

  const balanceNote = !configured
    ? t("home.stats.balanceNoteNoEnv")
    : totals != null
      ? t("home.stats.balanceNoteLive")
      : t("home.stats.balanceNoteError");

  const stats = [
    {
      title: t("home.stats.donationsTitle"),
      value: formatPublicBdt(donationTotal, locale),
      note: donationsNote,
      icon: <HandHeart className="size-5" aria-hidden />,
    },
    {
      title: t("home.stats.expensesTitle"),
      value: formatPublicBdt(expenseTotal, locale),
      note: expensesNote,
      icon: <Scale className="size-5" aria-hidden />,
    },
    {
      title: t("home.stats.balanceTitle"),
      value: formatPublicBdt(balance, locale),
      note: balanceNote,
      icon: <Landmark className="size-5" aria-hidden />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((item) => (
        <StatCard
          key={item.title}
          title={item.title}
          value={item.value}
          note={item.note}
          icon={item.icon}
        />
      ))}
    </div>
  );
}
