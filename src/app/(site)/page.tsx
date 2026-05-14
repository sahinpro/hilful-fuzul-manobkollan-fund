import { HomeHero } from "@/components/home-hero";
import { StatCard } from "@/components/stat-card";
import { siteImages } from "@/config/images";
import {
  fetchTransparencyTotals,
} from "@/lib/finance/transparency";
import { formatPublicBdt } from "@/lib/i18n/format-digits";
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

const quickLinks = [
  {
    href: "/স্বচ্ছতা",
    title: "স্বচ্ছতা",
    description: "সকল দান, ব্যয় এবং লেজার এন্ট্রি জনসাধারণের জন্য উন্মুক্ত থাকবে।",
    Icon: ScrollText,
  },
  {
    href: "/কার্যক্রম",
    title: "কার্যক্রম",
    description:
      "চলমান সহায়তা, শিক্ষা, চিকিৎসা ও সমাজ উন্নয়ন কার্যক্রম দেখা যাবে।",
    Icon: LayoutList,
  },
  {
    href: "/বার্ষিক-প্রতিবেদন",
    title: "বার্ষিক প্রতিবেদন",
    description: "বছরভিত্তিক আয়-ব্যয় সারাংশ ও ডকুমেন্ট ডাউনলোড।",
    Icon: FileSpreadsheet,
  },
  {
    href: "/নোটিশ",
    title: "নোটিশ",
    description: "সভা, কার্যক্রম ও গুরুত্বপূর্ণ ঘোষণা এখানে প্রকাশিত হবে।",
    Icon: Megaphone,
  },
] as const;

export default async function HomePage() {
  const totals = await fetchTransparencyTotals();
  const donationTotal = totals?.totalDonations ?? 0;
  const expenseTotal = totals?.totalExpenses ?? 0;
  const balance = totals?.balance ?? 0;

  const stats = [
    {
      title: "মোট দান",
      value: formatPublicBdt(donationTotal, "bn"),
      note: totals
        ? "প্রকাশিত (is_published) দান থেকে গণনা।"
        : "লাইভ ডাটা সংযুক্ত হলে আপডেট হবে",
      icon: HandHeart,
    },
    {
      title: "মোট ব্যয়",
      value: formatPublicBdt(expenseTotal, "bn"),
      note: totals
        ? "প্রকাশিত ব্যয় থেকে গণনা।"
        : "ক্যাটাগরি অনুযায়ী প্রকাশিত হবে",
      icon: Scale,
    },
    {
      title: "বর্তমান তহবিল",
      value: formatPublicBdt(balance, "bn"),
      note: totals
        ? "দান বিয়োগ ব্যয় (প্রকাশিত এন্ট্রি)।"
        : "স্বচ্ছতা পেইজে সম্পূর্ণ লেজার থাকবে",
      icon: Landmark,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-10 md:space-y-14 md:py-14">
      <HomeHero />

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
              alt="সবুজ প্রকৃতি — টেকসই উন্নয়ন ও কল্যাণের প্রতীক"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center p-6 md:p-10">
            <h2 className="text-xl font-bold md:text-2xl">আমাদের অঙ্গীকার</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              দান ও ব্যয়ের প্রতিটি ধাপ ডিজিটালভাবে নথিভুক্ত থাকবে; জনসাধারণের জন্য স্বচ্ছতা
              পেইজে সম্পূর্ণ হিসাব প্রকাশ থাকবে; ম্যানুয়াল দানের জন্য ডিজিটাল রসিদ পাওয়া যাবে।
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map(({ href, title, description, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col rounded-xl border border-border bg-card p-5 transition hover:border-primary"
          >
            <span className="mb-3 inline-flex w-fit rounded-lg bg-primary/10 p-2.5 text-primary">
              <Icon className="size-5 shrink-0" aria-hidden />
            </span>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
