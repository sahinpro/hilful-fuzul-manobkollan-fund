import { RevealGroup } from "@/components/motion/reveal";
import { PageSection } from "@/components/page-section";
import { PageShell } from "@/components/page-shell";
import {
  PublicChartsSkeleton,
  PublicLedgerSkeleton,
  PublicStatsSkeleton,
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
      <RevealGroup className="contents" staggerMs={65} delayChildrenMs={35}>
        <Suspense fallback={<PublicStatsSkeleton />}>
          <TransparencyStats />
        </Suspense>
      </RevealGroup>

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
