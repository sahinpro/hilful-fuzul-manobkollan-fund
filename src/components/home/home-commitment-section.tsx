import { AboutResolutionPrintLink } from "@/components/about-resolution-print-link";
import type { SiteLocale } from "@/lib/i18n/site-locale";
import type { createSiteTranslator } from "@/lib/i18n/site-translate";
import { cn } from "@/lib/utils";
import {
  Eye,
  HandHeart,
  MapPin,
  Receipt,
  ScrollText,
  Users,
} from "lucide-react";
import Link from "next/link";

const pillarDefs = [
  {
    key: "transparency" as const,
    Icon: Eye,
    href: "/transparency",
  },
  {
    key: "committee" as const,
    Icon: Users,
    href: "/about#leadership",
  },
  {
    key: "receipts" as const,
    Icon: Receipt,
    href: "/receipt/verify",
  },
  {
    key: "local" as const,
    Icon: MapPin,
    href: "/about",
  },
] as const;

type HomeCommitmentSectionProps = {
  locale: SiteLocale;
  t: ReturnType<typeof createSiteTranslator>;
};

export function HomeCommitmentSection({ locale, t }: HomeCommitmentSectionProps) {
  return (
    <section className="ios-card overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="grid md:grid-cols-2">
        <div
          className="relative flex min-h-[200px] flex-col items-center justify-center gap-3 bg-linear-to-br from-primary/12 via-muted/40 to-primary/6 p-8 md:min-h-[320px]"
          aria-hidden={false}
        >
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <HandHeart className="size-8" aria-hidden />
          </span>
          <p className="text-center text-sm font-medium text-muted-foreground">
            {t("home.commitment.imagePlaceholder")}
          </p>
        </div>

        <div className="flex flex-col justify-center p-6 md:p-10">
          <h2 className="text-xl font-bold md:text-2xl">{t("home.commitmentTitle")}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("home.commitmentBody")} {t("home.commitment.intro")}
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {pillarDefs.map(({ key, Icon, href }) => (
              <li key={key}>
                <Link
                  href={href}
                  className={cn(
                    "flex gap-3 rounded-xl border border-border/80 bg-muted/25 p-3 transition-colors",
                    "hover:border-primary/50 hover:bg-muted/50 active:bg-muted/70",
                  )}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug">
                      {t(`home.commitment.pillars.${key}.title`)}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                      {t(`home.commitment.pillars.${key}.description`)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/transparency"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 active:opacity-80"
            >
              <ScrollText className="size-4" aria-hidden />
              {t("home.commitment.ctaTransparency")}
            </Link>
            <AboutResolutionPrintLink
              locale={locale}
              label={t("home.commitment.ctaResolution")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
