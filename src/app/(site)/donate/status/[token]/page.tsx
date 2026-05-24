import { DonateStatusWorkspace } from "@/components/donate/donate-status-workspace";
import { PageSection } from "@/components/page-section";
import { PageShell } from "@/components/page-shell";
import { isDonateFlowConfigured } from "@/lib/donate/config";
import { getSiteTranslator } from "@/lib/i18n/site-server";
import { Clock } from "lucide-react";

type DonateStatusPageProps = {
  params: Promise<{ token: string }>;
};

export default async function DonateStatusPage(props: DonateStatusPageProps) {
  const { token } = await props.params;
  const { t } = await getSiteTranslator();
  const configured = isDonateFlowConfigured();

  return (
    <PageShell
      icon={<Clock className="size-6" aria-hidden />}
      title={t("pages.donate.status.title.pending")}
      subtitle={t("pages.donate.subtitle")}
    >
      <PageSection>
        <DonateStatusWorkspace accessToken={token} configured={configured} />
      </PageSection>
    </PageShell>
  );
}
