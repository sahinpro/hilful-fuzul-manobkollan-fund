import { HomeHero } from "@/components/home-hero";
import { HomePageMotion } from "@/components/home-page-motion";
import { PressableLink } from "@/components/motion/pressable-link";
import { RevealGroup } from "@/components/motion/reveal";
import { StatCard } from "@/components/stat-card";
import { siteImages } from "@/config/images";
import { mainNavItems } from "@/config/site";
import { fetchTransparencyTotals } from "@/lib/finance/transparency";
import { formatPublicBdt } from "@/lib/i18n/format-digits";
import { getSiteTranslator } from "@/lib/i18n/site-server";
import {
  FileSpreadsheet,
  HandHeart,
  Landmark,
  LayoutList,
  Megaphone,
  Scale,
  ScrollText,
} from "lucide-react";
import Image from "next/image";

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
  const totals = await fetchTransparencyTotals();
  const donationTotal = totals?.totalDonations ?? 0;
  const expenseTotal = totals?.totalExpenses ?? 0;
  const balance = totals?.balance ?? 0;

  const stats = [
    {
      title: t("home.stats.donationsTitle"),
      value: formatPublicBdt(donationTotal, locale),
      note: totals ? t("home.stats.donationsNoteLive") : t("home.stats.donationsNotePending"),
      icon: <HandHeart className="size-5" aria-hidden />,
    },
    {
      title: t("home.stats.expensesTitle"),
      value: formatPublicBdt(expenseTotal, locale),
      note: totals ? t("home.stats.expensesNoteLive") : t("home.stats.expensesNotePending"),
      icon: <Scale className="size-5" aria-hidden />,
    },
    {
      title: t("home.stats.balanceTitle"),
      value: formatPublicBdt(balance, locale),
      note: totals ? t("home.stats.balanceNoteLive") : t("home.stats.balanceNotePending"),
      icon: <Landmark className="size-5" aria-hidden />,
    },
  ];

  return (
    <HomePageMotion>
      <HomeHero
        badge={t("home.hero.badge")}
        title={t("home.hero.title")}
        tagline={t("home.hero.tagline")}
        imageAlt={t("home.hero.imageAlt")}
      />

      <RevealGroup className="grid gap-4 md:grid-cols-3" staggerMs={80} delayChildrenMs={50}>
        {stats.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            note={item.note}
            icon={item.icon}
          />
        ))}
      </RevealGroup>

      <section className="ios-card overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-4/3 min-h-[200px] w-full md:min-h-[280px]">
            <Image
              src={siteImages.bannerNature}
              alt={t("home.bannerAlt")}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center p-6 md:p-10">
            <h2 className="text-xl font-bold md:text-2xl">{t("home.commitmentTitle")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              {t("home.commitmentBody")}
            </p>
          </div>
        </div>
      </section>

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
