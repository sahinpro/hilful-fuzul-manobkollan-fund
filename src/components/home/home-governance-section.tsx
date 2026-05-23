import { AboutResolutionPrintLink } from "@/components/about-resolution-print-link";
import type { SiteLocale } from "@/lib/i18n/site-locale";
import type { createSiteTranslator } from "@/lib/i18n/site-translate";
import { getPublicExecutiveRows } from "@/lib/resolution/public-executives";
import { ArrowRight, Scale } from "lucide-react";
import Link from "next/link";

type HomeGovernanceSectionProps = {
  locale: SiteLocale;
  t: ReturnType<typeof createSiteTranslator>;
};

export function HomeGovernanceSection({ locale, t }: HomeGovernanceSectionProps) {
  const executives = getPublicExecutiveRows(locale);

  return (
    <section className="ios-card rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Scale className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold md:text-2xl">{t("home.governance.title")}</h2>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            {t("home.governance.subtitle")}
          </p>
          <p className="mt-2 text-xs font-medium text-primary/90">{t("home.governance.formed")}</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border/80">
        <p className="border-b border-border/80 bg-muted/30 px-4 py-2 text-sm font-semibold">
          {t("home.governance.executivesTitle")}
        </p>
        <ul className="divide-y divide-border/60">
          {executives.map((row) => (
            <li
              key={row.sl}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
            >
              <span className="font-medium">{row.name}</span>
              <span className="text-muted-foreground">{row.designation}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/about"
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted/60 active:bg-muted"
        >
          {t("home.governance.viewAbout")}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <AboutResolutionPrintLink
          locale={locale}
          label={t("home.commitment.ctaResolution")}
        />
        <Link
          href="/annual-report"
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted/60 active:bg-muted"
        >
          {t("nav.annualReport")}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
