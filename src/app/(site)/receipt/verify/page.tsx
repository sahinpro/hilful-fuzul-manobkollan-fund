import { ReceiptVerifyWorkspace } from "@/components/receipt/receipt-verify-workspace";
import { PageSection } from "@/components/page-section";
import { PageShell } from "@/components/page-shell";
import { isPublicReceiptLookupConfigured } from "@/lib/receipt/public-receipt-lookup";
import { getSiteTranslator } from "@/lib/i18n/site-server";
import { ScrollText } from "lucide-react";

type ReceiptVerifyPageProps = {
  searchParams: Promise<{ q?: string; payment?: string }>;
};

export default async function ReceiptVerifyPage(props: ReceiptVerifyPageProps) {
  const { q, payment } = await props.searchParams;
  const { t } = await getSiteTranslator();
  const configured = isPublicReceiptLookupConfigured();

  return (
    <PageShell
      icon={<ScrollText className="size-6" aria-hidden />}
      title={t("pages.receipt.title")}
      subtitle={t("pages.receipt.subtitle")}
    >
      <PageSection>
        <ReceiptVerifyWorkspace
          initialQuery={q ?? ""}
          initialPayment={payment ?? "all"}
          configured={configured}
        />
      </PageSection>
    </PageShell>
  );
}
