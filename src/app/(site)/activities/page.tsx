import { PageShell } from "@/components/page-shell";
import { getSiteTranslator } from "@/lib/i18n/site-server";
import { BookOpen, Building2, HeartHandshake, LayoutList, Stethoscope } from "lucide-react";

const activityBuckets = [
  { bucketKey: "religiousEducation" as const, icon: BookOpen },
  { bucketKey: "financialAid" as const, icon: HeartHandshake },
  { bucketKey: "healthcare" as const, icon: Stethoscope },
  { bucketKey: "community" as const, icon: Building2 },
] as const;

export default async function ActivitiesPage() {
  const { t } = await getSiteTranslator();

  return (
    <PageShell
      icon={LayoutList}
      title={t("pages.activities.title")}
      subtitle={t("pages.activities.subtitle")}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {activityBuckets.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.bucketKey} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="text-lg font-semibold">
                  {t(`pages.activities.bucket.${item.bucketKey}`)}
                </h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{t("pages.activities.bucketNote")}</p>
            </article>
          );
        })}
      </div>
    </PageShell>
  );
}
