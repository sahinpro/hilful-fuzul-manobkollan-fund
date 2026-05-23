import type { createSiteTranslator } from "@/lib/i18n/site-translate";
import { HelpCircle } from "lucide-react";

const faqKeys = [
  "whereMoney",
  "seeAccounts",
  "receipt",
  "oversight",
  "annualReport",
] as const;

type HomeFaqSectionProps = {
  t: ReturnType<typeof createSiteTranslator>;
};

export function HomeFaqSection({ t }: HomeFaqSectionProps) {
  return (
    <section className="ios-card rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <HelpCircle className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-xl font-bold md:text-2xl">{t("home.faq.title")}</h2>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">{t("home.faq.subtitle")}</p>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {faqKeys.map((key) => (
          <details
            key={key}
            className="group rounded-xl border border-border/80 bg-muted/15 open:bg-muted/25"
          >
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-2">
                {t(`home.faq.items.${key}.q`)}
                <span
                  className="text-muted-foreground transition-transform group-open:rotate-180"
                  aria-hidden
                >
                  ▾
                </span>
              </span>
            </summary>
            <p className="border-t border-border/60 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              {t(`home.faq.items.${key}.a`)}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
