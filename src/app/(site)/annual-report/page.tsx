import { PageSection } from "@/components/page-section";
import { PageShell } from "@/components/page-shell";
import { getSiteTranslator } from "@/lib/i18n/site-server";
import { FileSpreadsheet } from "lucide-react";

export default async function AnnualReportPage() {
  const { t } = await getSiteTranslator();

  return (
    <PageShell
      icon={<FileSpreadsheet className="size-6" aria-hidden />}
      title={t("pages.annualReport.title")}
      subtitle={t("pages.annualReport.subtitle")}
    >
      <PageSection>
        <div className="ios-card rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="size-6 text-primary" aria-hidden />
            <h2 className="text-lg font-semibold">
              {t("pages.annualReport.cardTitle")}
            </h2>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("pages.annualReport.cardBody")}
          </p>
        </div>
      </PageSection>
    </PageShell>
  );
}
