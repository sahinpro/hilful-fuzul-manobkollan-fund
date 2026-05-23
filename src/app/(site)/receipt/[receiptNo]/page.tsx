import { ReceiptDetailCard } from "@/components/receipt/receipt-detail-card";
import { ReceiptVerifyWorkspace } from "@/components/receipt/receipt-verify-workspace";
import { PageSection } from "@/components/page-section";
import { PageShell } from "@/components/page-shell";
import {
  isPublicReceiptLookupConfigured,
  lookupPublicReceipt,
} from "@/lib/receipt/public-receipt-lookup";
import { getSiteTranslator } from "@/lib/i18n/site-server";
import { ScrollText } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type ReceiptPageProps = {
  params: Promise<{ receiptNo: string }>;
};

export default async function ReceiptDetailPage(props: ReceiptPageProps) {
  const { receiptNo } = await props.params;
  const decoded = decodeURIComponent(receiptNo).trim();

  if (decoded.toLowerCase() === "verify") {
    redirect("/receipt/verify");
  }

  const { locale, t } = await getSiteTranslator();
  const configured = isPublicReceiptLookupConfigured();

  if (!configured) {
    return (
      <PageShell
        icon={<ScrollText className="size-6" aria-hidden />}
        title={t("pages.receipt.title")}
        subtitle={t("pages.receipt.subtitle")}
      >
        <PageSection>
          <ReceiptVerifyWorkspace configured={false} initialQuery={decoded} />
        </PageSection>
      </PageShell>
    );
  }

  const record = await lookupPublicReceipt(decoded);
  if (!record) {
    notFound();
  }

  const paymentKeys = ["all", "cash", "bank", "bkash", "nagad", "rocket", "other"] as const;

  function paymentLabel(method: string): string {
    const key = method.toLowerCase();
    if (paymentKeys.includes(key as (typeof paymentKeys)[number])) {
      return t(`pages.receipt.payment.${key}`);
    }
    return method;
  }

  return (
    <PageShell
      icon={<ScrollText className="size-6" aria-hidden />}
      title={t("pages.receipt.title")}
      subtitle={t("pages.receipt.subtitle")}
    >
      <PageSection className="space-y-4">
        <ReceiptDetailCard
          record={record}
          locale={locale}
          labels={{
            receiptNo: t("pages.receipt.receiptNoLabel"),
            donorName: t("pages.receipt.donorName"),
            donorFathersName: t("pages.receipt.donorFathersName"),
            amount: t("pages.receipt.amount"),
            paymentMethod: t("pages.receipt.paymentMethod"),
            receivedAt: t("pages.receipt.receivedAt"),
            printReceipt: t("pages.receipt.printReceipt"),
            backToSearch: t("pages.receipt.backToSearch"),
            verifiedNote: t("pages.receipt.verifiedNote"),
            paymentLabel,
          }}
        />
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/receipt/verify" className="text-primary hover:underline">
            {t("pages.receipt.backToSearch")}
          </Link>
        </p>
      </PageSection>
    </PageShell>
  );
}
