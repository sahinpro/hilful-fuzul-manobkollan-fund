import type { createSiteTranslator } from "@/lib/i18n/site-translate";
import { ArrowRight, CheckCircle2, HandCoins, ScrollText, Wallet } from "lucide-react";
import Link from "next/link";

const stepKeys = ["donate", "record", "approve", "publish"] as const;

const stepIcons = [HandCoins, Wallet, CheckCircle2, ScrollText] as const;

type HomeHowItWorksProps = {
  t: ReturnType<typeof createSiteTranslator>;
};

export function HomeHowItWorks({ t }: HomeHowItWorksProps) {
  return (
    <section className="ios-card rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold md:text-2xl">{t("home.howItWorks.title")}</h2>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            {t("home.howItWorks.subtitle")}
          </p>
        </div>
        <Link
          href="/transparency"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {t("home.commitment.ctaTransparency")}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stepKeys.map((key, index) => {
          const Icon = stepIcons[index]!;
          return (
            <li
              key={key}
              className="relative rounded-xl border border-border/70 bg-muted/20 p-4"
            >
              <span className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="font-semibold">{t(`home.howItWorks.steps.${key}.title`)}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {t(`home.howItWorks.steps.${key}.description`)}
              </p>
              {index < stepKeys.length - 1 ? (
                <ArrowRight
                  className="absolute -right-3 top-1/2 hidden size-5 -translate-y-1/2 text-muted-foreground/50 lg:block"
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
