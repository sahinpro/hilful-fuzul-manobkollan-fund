import { AboutLeadershipTables } from "@/components/about-leadership-tables";
import { AboutResolutionContent } from "@/components/about-resolution-content";
import { PageShell } from "@/components/page-shell";
import { siteImages } from "@/config/images";
import { fetchLeadershipMembers } from "@/lib/site/leadership";
import { getSiteTranslator } from "@/lib/i18n/site-server";
import { Users } from "lucide-react";
import Image from "next/image";

export default async function AboutPage() {
  const { t } = await getSiteTranslator();
  const leadershipMembers = await fetchLeadershipMembers();

  return (
    <PageShell
      icon={Users}
      title={t("pages.about.title")}
      subtitle={t("pages.about.subtitle")}
    >
      <div className="space-y-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div className="relative aspect-4/3 min-h-[200px] overflow-hidden rounded-xl border border-border lg:sticky lg:top-24">
            <Image
              src={siteImages.bannerNature}
              alt={t("pages.about.imageAlt")}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
          </div>
          <AboutResolutionContent t={t} />
        </div>

        <AboutLeadershipTables members={leadershipMembers} t={t} />
      </div>
    </PageShell>
  );
}
