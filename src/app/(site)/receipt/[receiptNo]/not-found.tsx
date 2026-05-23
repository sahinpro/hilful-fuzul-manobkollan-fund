import { PageSection } from "@/components/page-section";
import { PageShell } from "@/components/page-shell";
import { getSiteTranslator } from "@/lib/i18n/site-server";
import { ScrollText } from "lucide-react";
import Link from "next/link";

export default async function ReceiptNotFound() {
  const { t } = await getSiteTranslator();

  return (
    <PageShell
      icon={<ScrollText className="size-6" aria-hidden />}
      title={t("pages.receipt.title")}
      subtitle={t("pages.receipt.subtitle")}
    >
      <PageSection>
        <div className="ios-card rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="text-lg font-semibold">{t("pages.receipt.notFoundTitle")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("pages.receipt.noResults")}</p>
          <Link
            href="/receipt/verify"
            className="mt-6 inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            {t("pages.receipt.backToSearch")}
          </Link>
        </div>
      </PageSection>
    </PageShell>
  );
}
