import { HomeActivitiesSnapshot } from "@/components/home/home-activities-snapshot";
import { HomeCommitmentSection } from "@/components/home/home-commitment-section";
import { HomeFaqSection } from "@/components/home/home-faq-section";
import { HomeGovernanceSection } from "@/components/home/home-governance-section";
import { HomeHowItWorks } from "@/components/home/home-how-it-works";
import { HomeHero } from "@/components/home-hero";
import { HomePageMotion } from "@/components/home-page-motion";
import { PressableLink } from "@/components/motion/pressable-link";
import { RevealGroup } from "@/components/motion/reveal";
import { HomeStats } from "@/components/home/home-stats";
import { PublicStatsSkeleton } from "@/components/public/public-finance-skeletons";
import { mainNavItems } from "@/config/site";
import { getSiteTranslator } from "@/lib/i18n/site-server";
import {
  FileSpreadsheet,
  LayoutList,
  Megaphone,
  ScrollText,
} from "lucide-react";
import { Suspense } from "react";

const quickLinkDefs = [
  { navKey: "transparency" as const, messageKey: "transparency" as const, Icon: ScrollText },
  { navKey: "activities" as const, messageKey: "activities" as const, Icon: LayoutList },
  { navKey: "annualReport" as const, messageKey: "annualReport" as const, Icon: FileSpreadsheet },
  { navKey: "notices" as const, messageKey: "notices" as const, Icon: Megaphone },
] as const;

function hrefForNavKey(key: (typeof quickLinkDefs)[number]["navKey"]): string {
  const item = mainNavItems.find((i) => i.key === key);
  if (!item) throw new Error(`Missing nav item: ${key}`);
  return item.href;
}

export default async function HomePage() {
  const { locale, t } = await getSiteTranslator();

  return (
    <HomePageMotion>
      <HomeHero
        badge={t("home.hero.badge")}
        title={t("home.hero.title")}
        tagline={t("home.hero.tagline")}
        imageAlt={t("home.hero.imageAlt")}
      />

      <RevealGroup className="contents" staggerMs={80} delayChildrenMs={50}>
        <Suspense fallback={<PublicStatsSkeleton />}>
          <HomeStats />
        </Suspense>
      </RevealGroup>

      <HomeCommitmentSection locale={locale} t={t} />
      <HomeHowItWorks t={t} />
      <HomeGovernanceSection locale={locale} t={t} />
      <HomeActivitiesSnapshot t={t} />
      <HomeFaqSection t={t} />

      <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" staggerMs={65} delayChildrenMs={30}>
        {quickLinkDefs.map(({ navKey, messageKey, Icon }) => (
          <PressableLink
            key={navKey}
            href={hrefForNavKey(navKey)}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-primary/60 hover:shadow-md"
          >
            <span className="mb-3 inline-flex w-fit rounded-xl bg-primary/10 p-2.5 text-primary">
              <Icon className="size-5 shrink-0" aria-hidden />
            </span>
            <h2 className="text-lg font-semibold">{t(`home.quick.${messageKey}.title`)}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(`home.quick.${messageKey}.description`)}
            </p>
          </PressableLink>
        ))}
      </RevealGroup>
    </HomePageMotion>
  );
}
