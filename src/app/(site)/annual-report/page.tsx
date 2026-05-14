import { PageShell } from "@/components/page-shell";
import { getSiteTranslator } from "@/lib/i18n/site-server";
import { FileSpreadsheet } from "lucide-react";

export default async function AnnualReportPage() {
  const { t } = await getSiteTranslator();

  return (
    <PageShell
      icon={FileSpreadsheet}
      title={t("pages.annualReport.title")}
      subtitle={t("pages.annualReport.subtitle")}
    >
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6 text-primary" aria-hidden />
          <h2 className="text-lg font-semibold">{t("pages.annualReport.cardTitle")}</h2>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{t("pages.annualReport.cardBody")}</p>
      </div>
    </PageShell>
  );
}
