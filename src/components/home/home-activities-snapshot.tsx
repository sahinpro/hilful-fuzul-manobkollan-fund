import type { createSiteTranslator } from "@/lib/i18n/site-translate";
import {
  ArrowRight,
  BookOpen,
  Building2,
  HeartHandshake,
  LayoutList,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";

const buckets = [
  { bucketKey: "religiousEducation" as const, Icon: BookOpen },
  { bucketKey: "financialAid" as const, Icon: HeartHandshake },
  { bucketKey: "healthcare" as const, Icon: Stethoscope },
  { bucketKey: "community" as const, Icon: Building2 },
] as const;

type HomeActivitiesSnapshotProps = {
  t: ReturnType<typeof createSiteTranslator>;
};

export function HomeActivitiesSnapshot({ t }: HomeActivitiesSnapshotProps) {
  return (
    <section className="ios-card rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LayoutList className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-xl font-bold md:text-2xl">{t("home.activitiesSnapshot.title")}</h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              {t("home.activitiesSnapshot.subtitle")}
            </p>
          </div>
        </div>
        <Link
          href="/activities"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {t("home.activitiesSnapshot.viewAll")}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {buckets.map(({ bucketKey, Icon }) => (
          <li key={bucketKey}>
            <Link
              href="/activities"
              className="flex items-center gap-3 rounded-xl border border-border/80 bg-muted/20 p-4 transition-colors hover:border-primary/50 hover:bg-muted/40 active:bg-muted/60"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="font-medium">{t(`pages.activities.bucket.${bucketKey}`)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
