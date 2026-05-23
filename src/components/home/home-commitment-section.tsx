import { AboutResolutionPrintLink } from "@/components/about-resolution-print-link";
import { HomeVolunteerJourney } from "@/components/home/home-volunteer-journey";
import {
  volunteerJourneyImages,
  volunteerJourneySlideIds,
} from "@/config/images";
import type { SiteLocale } from "@/lib/i18n/site-locale";
import type { createSiteTranslator } from "@/lib/i18n/site-translate";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Eye, MapPin, Receipt, ScrollText, Users } from "lucide-react";
import Link from "next/link";

const pillarDefs = [
  { key: "transparency" as const, Icon: Eye, href: "/transparency" },
  { key: "committee" as const, Icon: Users, href: "/about#leadership" },
  { key: "receipts" as const, Icon: Receipt, href: "/receipt/verify" },
  { key: "local" as const, Icon: MapPin, href: "/about" },
] as const;

type HomeCommitmentSectionProps = {
  locale: SiteLocale;
  t: ReturnType<typeof createSiteTranslator>;
};

export function HomeCommitmentSection({ locale, t }: HomeCommitmentSectionProps) {
  const journeySlides = volunteerJourneySlideIds.map((id) => ({
    id,
    imageSrc: volunteerJourneyImages[id],
    title: t(`home.commitment.journey.slides.${id}.title`),
    caption: t(`home.commitment.journey.slides.${id}.caption`),
    alt: t(`home.commitment.journey.slides.${id}.alt`),
  }));

  return (
    <section className="ios-card overflow-hidden rounded-2xl border border-border/80 bg-card shadow-md ring-1 ring-primary/10">
      <div className="grid lg:grid-cols-2">
        <HomeVolunteerJourney
          slides={journeySlides}
          sectionTitle={t("home.commitment.journey.title")}
          sectionSubtitle={t("home.commitment.journey.subtitle")}
          orgLabel={t("site.shortName")}
          logoAlt={t("site.logoAlt")}
          stepLabels={volunteerJourneySlideIds.map((_, index) =>
            t("home.commitment.journey.stepLabel", { n: String(index + 1) }),
          )}
        />

        {/* Content */}
        <div className="flex flex-col justify-center p-6 md:p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {t("home.commitment.badge")}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
            {t("home.commitmentTitle")}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-foreground/90">
            {t("home.commitmentBody")}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">
            {t("home.commitment.intro")}
          </p>

          <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
            {pillarDefs.map(({ key, Icon, href }) => (
              <li key={key} className="min-h-0">
                <Link
                  href={href}
                  className={cn(
                    "group flex h-full gap-3 rounded-xl border border-border/70 bg-muted/20 p-3.5",
                    "transition-all duration-200 hover:border-primary/45 hover:bg-primary/5 hover:shadow-sm",
                    "active:scale-[0.99]",
                  )}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary transition-colors group-hover:bg-primary/18">
                    <Icon className="size-4.5" strokeWidth={2} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-1">
                      <span className="text-sm font-semibold leading-snug">
                        {t(`home.commitment.pillars.${key}.title`)}
                      </span>
                      <ArrowUpRight
                        className="size-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                        aria-hidden
                      />
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                      {t(`home.commitment.pillars.${key}.description`)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-2.5 border-t border-border/60 pt-6 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/transparency"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110 active:scale-[0.99] sm:flex-none sm:px-6"
            >
              <ScrollText className="size-4" aria-hidden />
              {t("home.commitment.ctaTransparency")}
            </Link>
            <AboutResolutionPrintLink
              locale={locale}
              label={t("home.commitment.ctaResolution")}
              size="lg"
              className="min-h-11 w-full justify-center gap-2 sm:w-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
