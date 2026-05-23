import { PageSection } from "@/components/page-section";
import { PageShell } from "@/components/page-shell";
import {
  PublicChartsSkeleton,
  PublicLedgerSkeleton,
} from "@/components/public/public-finance-skeletons";
import { TransparencyCharts } from "@/components/transparency/transparency-charts";
import { TransparencyLedger } from "@/components/transparency/transparency-ledger";
import { TransparencyStats } from "@/components/transparency/transparency-stats";
import { getSiteTranslator } from "@/lib/i18n/site-server";
import { ScrollText } from "lucide-react";
import { Suspense } from "react";

export default async function TransparencyPage() {
  const { t } = await getSiteTranslator();

  return (
    <PageShell
      icon={<ScrollText className="size-6" aria-hidden />}
      title={t("pages.transparency.title")}
      subtitle={t("pages.transparency.subtitle")}
    >
      <TransparencyStats />

      <PageSection>
        <Suspense fallback={<PublicChartsSkeleton />}>
          <TransparencyCharts />
        </Suspense>
      </PageSection>

      <PageSection>
        <Suspense fallback={<PublicLedgerSkeleton />}>
          <TransparencyLedger />
        </Suspense>
      </PageSection>
    </PageShell>
  );
}
