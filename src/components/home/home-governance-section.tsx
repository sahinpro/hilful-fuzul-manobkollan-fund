import { AboutResolutionPrintLink } from "@/components/about-resolution-print-link";
import type { SiteLocale } from "@/lib/i18n/site-locale";
import type { createSiteTranslator } from "@/lib/i18n/site-translate";
import { getPublicExecutiveRows } from "@/lib/resolution/public-executives";
import { cn } from "@/lib/utils";
import { ArrowRight, FileSpreadsheet, Scale, Users } from "lucide-react";
import Link from "next/link";

type HomeGovernanceSectionProps = {
  locale: SiteLocale;
  t: ReturnType<typeof createSiteTranslator>;
};

export function HomeGovernanceSection({ locale, t }: HomeGovernanceSectionProps) {
  const executives = getPublicExecutiveRows(locale);

  return (
    <section className="ios-card rounded-2xl border border-border/80 bg-card p-6 shadow-md ring-1 ring-primary/10 md:p-8">
      <div className="flex flex-wrap items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <Scale className="size-6" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">{t("home.governance.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("home.governance.subtitle")}
          </p>
          <p className="mt-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {t("home.governance.formed")}
          </p>
        </div>
      </div>

      <div className="mt-7 overflow-hidden rounded-xl border border-border/70 bg-muted/15">
        <div className="flex items-center gap-2 border-b border-border/70 bg-muted/30 px-4 py-2.5">
          <Users className="size-4 text-primary" aria-hidden />
          <p className="text-sm font-semibold">{t("home.governance.executivesTitle")}</p>
        </div>
        <ul className="divide-y divide-border/60">
          {executives.map((row) => (
            <li
              key={row.sl}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 text-sm"
            >
              <span className="font-medium">{row.name}</span>
              <span className="rounded-full bg-background px-2.5 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-border/80">
                {row.designation}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 border-t border-border/60 pt-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("home.governance.actionsLabel")}
        </p>
        <div className="grid gap-2.5 sm:grid-cols-3">
          <Link
            href="/about"
            className={cn(
              "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary/35 bg-primary/8 px-4 text-sm font-semibold text-foreground",
              "transition-colors hover:bg-primary/14 active:scale-[0.99]",
            )}
          >
            <Users className="size-4 shrink-0 text-primary" aria-hidden />
            <span className="truncate">{t("home.governance.viewAboutShort")}</span>
            <ArrowRight className="size-4 shrink-0 opacity-70" aria-hidden />
          </Link>
          <AboutResolutionPrintLink
            locale={locale}
            label={t("home.commitment.ctaResolution")}
            size="lg"
            className="min-h-11 w-full justify-center gap-2 border-border/80"
          />
          <Link
            href="/annual-report"
            className={cn(
              "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border/80 bg-background px-4 text-sm font-medium",
              "transition-colors hover:bg-muted/60 active:scale-[0.99]",
            )}
          >
            <FileSpreadsheet className="size-4 shrink-0 text-primary" aria-hidden />
            <span className="truncate">{t("nav.annualReport")}</span>
            <ArrowRight className="size-4 shrink-0 opacity-60" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
