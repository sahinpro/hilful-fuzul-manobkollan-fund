import { FundOverviewCharts } from "@/components/fund-overview-charts";
import { buildCommitteeChartData } from "@/lib/finance/public-charts";
import {
  fetchPublishedExpenseByCategory,
  isSupabaseConfigured,
} from "@/lib/finance/transparency";
import { getSiteTranslator } from "@/lib/i18n/site-server";
import { fetchLeadershipMembers } from "@/lib/site/leadership";

export async function TransparencyCharts() {
  const { t } = await getSiteTranslator();
  const configured = isSupabaseConfigured();

  const [expenseBreakdown, leadership] = await Promise.all([
    fetchPublishedExpenseByCategory(),
    fetchLeadershipMembers(),
  ]);

  const committeeSplit = buildCommitteeChartData(leadership, (key) =>
    t(`charts.committee.${key}`),
  );

  const expenseNote = !configured
    ? t("charts.expenseNote.noEnv")
    : expenseBreakdown == null
      ? t("charts.expenseNote.error")
      : expenseBreakdown.rows.length === 0
        ? t("charts.expenseNote.empty")
        : t("charts.expenseNote.live");

  const committeeNote = !configured
    ? t("charts.committeeNote.noEnv")
    : leadership.length === 0
      ? t("charts.committeeNote.empty")
      : t("charts.committeeNote.live");

  return (
    <FundOverviewCharts
      expenseByCategory={expenseBreakdown?.rows ?? []}
      committeeSplit={committeeSplit}
      expenseNote={expenseNote}
      committeeNote={committeeNote}
    />
  );
}
