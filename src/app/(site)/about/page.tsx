import { PageShell } from "@/components/page-shell";
import { siteImages } from "@/config/images";
import { getSiteTranslator } from "@/lib/i18n/site-server";
import { BookOpen, Users } from "lucide-react";
import Image from "next/image";

export default async function AboutPage() {
  const { t } = await getSiteTranslator();

  return (
    <PageShell
      icon={Users}
      title={t("pages.about.title")}
      subtitle={t("pages.about.subtitle")}
    >
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="relative aspect-4/3 min-h-[200px] overflow-hidden rounded-xl border border-border">
          <Image
            src={siteImages.bannerNature}
            alt={t("pages.about.imageAlt")}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground md:text-base">
          <div className="flex items-center gap-2 text-foreground">
            <BookOpen className="h-5 w-5 text-primary" aria-hidden />
            <span className="font-semibold">{t("pages.about.sectionTitle")}</span>
          </div>
          <p>{t("pages.about.body")}</p>
        </div>
      </div>
    </PageShell>
  );
}
