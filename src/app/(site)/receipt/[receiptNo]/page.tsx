import { PageSection } from "@/components/page-section";
import { PageShell } from "@/components/page-shell";
import { getSiteTranslator } from "@/lib/i18n/site-server";

type ReceiptPageProps = {
  params: Promise<{ receiptNo: string }>;
};

export default async function ReceiptVerifyPage(props: ReceiptPageProps) {
  const { receiptNo } = await props.params;
  const { t } = await getSiteTranslator();

  return (
    <PageShell
      title={t("pages.receipt.title")}
      subtitle={t("pages.receipt.subtitle")}
    >
      <PageSection>
        <div className="ios-card rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">{t("pages.receipt.receiptNoLabel")}</p>
          <p className="mt-1 text-xl font-bold">{receiptNo}</p>
          <p className="mt-4 text-sm text-muted-foreground">{t("pages.receipt.pendingBody")}</p>
        </div>
      </PageSection>
    </PageShell>
  );
}
