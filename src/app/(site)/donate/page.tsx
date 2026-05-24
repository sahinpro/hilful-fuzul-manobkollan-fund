import { DonateForm } from "@/components/donate/donate-form";
import { PageSection } from "@/components/page-section";
import { PageShell } from "@/components/page-shell";
import { isDonateFlowConfigured } from "@/lib/donate/config";
import { getSiteTranslator } from "@/lib/i18n/site-server";
import { HandCoins } from "lucide-react";

export default async function DonatePage() {
  const { t } = await getSiteTranslator();
  const configured = isDonateFlowConfigured();

  return (
    <PageShell
      icon={<HandCoins className="size-6" aria-hidden />}
      title={t("pages.donate.title")}
      subtitle={t("pages.donate.subtitle")}
    >
      <PageSection>
        <DonateForm mode="donate" configured={configured} />
      </PageSection>
    </PageShell>
  );
}
