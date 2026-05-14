import { HomeHero } from "@/components/home-hero";
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
import Link from "next/link";

export const dynamic = "force-dynamic";

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
      icon: HandHeart,
    },
    {
      title: t("home.stats.expensesTitle"),
      value: formatPublicBdt(expenseTotal, locale),
      note: totals ? t("home.stats.expensesNoteLive") : t("home.stats.expensesNotePending"),
      icon: Scale,
    },
    {
      title: t("home.stats.balanceTitle"),
      value: formatPublicBdt(balance, locale),
      note: totals ? t("home.stats.balanceNoteLive") : t("home.stats.balanceNotePending"),
      icon: Landmark,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-10 md:space-y-14 md:py-14">
      <HomeHero
        badge={t("home.hero.badge")}
        title={t("home.hero.title")}
        tagline={t("home.hero.tagline")}
        imageAlt={t("home.hero.imageAlt")}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            note={item.note}
            icon={item.icon}
          />
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
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

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinkDefs.map(({ navKey, messageKey, Icon }) => (
          <Link
            key={navKey}
            href={hrefForNavKey(navKey)}
            className="flex flex-col rounded-xl border border-border bg-card p-5 transition hover:border-primary"
          >
            <span className="mb-3 inline-flex w-fit rounded-lg bg-primary/10 p-2.5 text-primary">
              <Icon className="size-5 shrink-0" aria-hidden />
            </span>
            <h2 className="text-lg font-semibold">{t(`home.quick.${messageKey}.title`)}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(`home.quick.${messageKey}.description`)}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
