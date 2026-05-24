import { DonateWorkspace } from "@/components/donate/donate-workspace";
import { PageSection } from "@/components/page-section";
import { PageShell } from "@/components/page-shell";
import { isDonateFlowConfigured } from "@/lib/donate/config";
import { getSiteTranslator } from "@/lib/i18n/site-server";
import { HandCoins } from "lucide-react";

export default async function DonateClaimPage() {
  const { t } = await getSiteTranslator();
  const configured = isDonateFlowConfigured();

  return (
    <PageShell
      icon={<HandCoins className="size-6" aria-hidden />}
      title={t("pages.donate.claimTitle")}
      subtitle={t("pages.donate.claimSubtitle")}
    >
      <PageSection>
        <DonateWorkspace mode="claim" configured={configured} />
      </PageSection>
    </PageShell>
  );
}
