import { CheckCircle2, Scale } from "lucide-react";

type Translate = (key: string) => string;

const OBJECTIVE_KEYS = [
  "pages.about.objectives.religious",
  "pages.about.objectives.poverty",
  "pages.about.objectives.justice",
  "pages.about.objectives.humanity",
  "pages.about.objectives.education",
  "pages.about.objectives.transparency",
] as const;

const POLICY_KEYS = [
  "pages.about.policies.nonRefundable",
  "pages.about.policies.membership",
] as const;

export function AboutResolutionContent({ t }: { t: Translate }) {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground md:text-base">
        <p className="leading-relaxed text-foreground/90">{t("pages.about.body")}</p>
        <ul className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
          <li>{t("pages.about.formation.date")}</li>
          <li>{t("pages.about.formation.venue")}</li>
          <li>{t("pages.about.formation.chair")}</li>
        </ul>
      </div>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <CheckCircle2 className="size-5 text-primary" aria-hidden />
          {t("pages.about.objectivesTitle")}
        </h2>
        <ul className="space-y-2 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground md:text-base">
          {OBJECTIVE_KEYS.map((key) => (
            <li key={key} className="flex gap-2 leading-relaxed">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Scale className="size-5 text-primary" aria-hidden />
          {t("pages.about.policiesTitle")}
        </h2>
        <ul className="space-y-2 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground md:text-base">
          {POLICY_KEYS.map((key) => (
            <li key={key} className="flex gap-2 leading-relaxed">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
