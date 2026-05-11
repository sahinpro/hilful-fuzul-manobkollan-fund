export type NavItem = {
  href: string;
  label: string;
  description: string;
};

/**
 * Top bar: five pages only. Home is linked from logo + footer, not here.
 * Bangla `href` values must stay in sync with `src/lib/routes/bangla-paths.ts`
 * (middleware rewrites those URLs to ASCII `app/` routes).
 */
export const mainNavItems = [
  {
    href: "/আমাদের-সম্পর্কে",
    label: "আমাদের সম্পর্কে",
    description: "দৃষ্টিভঙ্গি, লক্ষ্য ও পরিচালনা নীতি",
  },
  {
    href: "/কার্যক্রম",
    label: "কার্যক্রম",
    description: "চলমান সামাজিক ও দ্বীনি কার্যক্রম",
  },
  {
    href: "/স্বচ্ছতা",
    label: "স্বচ্ছতা",
    description: "দান, ব্যয় ও হিসাবের প্রকাশিত তালিকা",
  },
  {
    href: "/বার্ষিক-প্রতিবেদন",
    label: "বার্ষিক প্রতিবেদন",
    description: "বছরভিত্তিক আর্থিক ও কার্যক্রম প্রতিবেদন",
  },
  {
    href: "/নোটিশ",
    label: "নোটিশ",
    description: "গুরুত্বপূর্ণ ঘোষণা ও আপডেট",
  },
] satisfies NavItem[];

export const siteConfig = {
  name: "হিলফুল ফুজুল মানবকল্যাণ সংগঠন",
  shortName: "হিলফুল ফুজুল",
  location: "তালেরতল, পলাশ, বিশম্ভরপুর, সুনামগঞ্জ",
  logoSrc: "/logo.png" as const,
  contact: {
    phoneLabel: "ফোন",
    phone: "০১৭XX-XXXXXXX",
    emailLabel: "ইমেইল",
    email: "hilful.fuzul@example.com",
    addressLabel: "ঠিকানা",
    addressLines: ["তালেরতল, পলাশ, বিশম্ভরপুর", "সুনামগঞ্জ সদর, সুনামগঞ্জ"],
  },
  paymentBanner: {
    src: "/Group%201903.png" as const,
    alt: "bKash, NexusPay, Nagad, Rocket — গ্রহণযোগ্য পেমেন্ট মাধ্যম",
    width: 720,
    height: 160,
  },
  footerQuickLinks: [
    { href: "/", label: "হোম", description: "মূল পাতা" },
    ...mainNavItems,
  ] satisfies NavItem[],
};
