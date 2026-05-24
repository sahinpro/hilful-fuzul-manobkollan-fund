import type { SiteLocale } from "@/lib/i18n/site-locale";

export type NavItem = {
  href: string;
  /** Key under `nav.*` in site locale JSON. */
  key: string;
};

/** Top bar: five pages only. Home is linked from logo + footer, not here. */
export const mainNavItems = [
  { href: "/about", key: "about" },
  { href: "/activities", key: "activities" },
  { href: "/transparency", key: "transparency" },
  { href: "/annual-report", key: "annualReport" },
  { href: "/notices", key: "notices" },
] satisfies NavItem[];

export type SiteLocaleText = {
  name: string;
  shortName: string;
  location: string;
  contact: {
    phoneLabel: string;
    emailLabel: string;
    addressLabel: string;
    addressLines: readonly string[];
  };
  paymentBannerAlt: string;
};

export type SiteSeoText = {
  title: string;
  titleTemplate: string;
  description: string;
  keywords: readonly string[];
};

export const siteLocaleText = {
  en: {
    name: "Hilful Fuzul Manobkallyan Organisation & Fund",
    shortName: "Hilful Fuzul",
    location: "তালেরতল, পলাশ, বিশম্ভরপুর, সুনামগঞ্জ",
    contact: {
      phoneLabel: "Phone",
      emailLabel: "Email",
      addressLabel: "Address",
      addressLines: ["তালেরতল, পলাশ, বিশম্ভরপুর"],
    },
    paymentBannerAlt:
      "bKash, NexusPay, Nagad, Rocket — accepted payment methods",
  },
  bn: {
    name: "হিলফুল ফুজুল মানবকল্যাণ সংগঠন ও তহবিল",
    shortName: "হিলফুল ফুজুল",
    location: "তালেরতল, পলাশ, বিশম্ভরপুর, সুনামগঞ্জ",
    contact: {
      phoneLabel: "ফোন",
      emailLabel: "ইমেইল",
      addressLabel: "ঠিকানা",
      addressLines: ["তালেরতল, পলাশ, বিশম্ভরপুর"],
    },
    paymentBannerAlt: "bKash, NexusPay, Nagad, Rocket — গৃহীত পেমেন্ট পদ্ধতি",
  },
} as const satisfies Record<SiteLocale, SiteLocaleText>;

export const siteSeoByLocale = {
  en: {
    title: "Hilful Fuzul Manobkallyan Organisation & Fund",
    titleTemplate: "%s | Hilful Fuzul Manobkallyan Organisation & Fund",
    description:
      "Official website of Hilful Fuzul Manobkallyan Organisation & Fund — transparent donations, expenses, and community welfare programmes in Sunamganj, Bangladesh.",
    keywords: [
      "Hilful Fuzul",
      "Manobkallyan Fund",
      "charity",
      "donation",
      "transparency",
      "Sunamganj",
      "Bangladesh",
      "welfare",
    ],
  },
  bn: {
    title: "হিলফুল ফুজুল মানবকল্যাণ সংগঠন ও তহবিল",
    titleTemplate: "%s | হিলফুল ফুজুল মানবকল্যাণ সংগঠন ও তহবিল",
    description:
      "হিলফুল ফুজুল মানবকল্যাণ সংগঠন ও তহবিলের অফিসিয়াল ওয়েবসাইট — সুনামগঞ্জ, বাংলাদেশে স্বচ্ছ দান, ব্যয় ও জনকল্যাণমূলক কার্যক্রম।",
    keywords: [
      "হিলফুল ফুজুল",
      "মানবকল্যাণ তহবিল",
      "দান",
      "স্বচ্ছতা",
      "সুনামগঞ্জ",
      "বাংলাদেশ",
      "জনকল্যাণ",
    ],
  },
} as const satisfies Record<SiteLocale, SiteSeoText>;

export function getSiteLocaleText(locale: SiteLocale): SiteLocaleText {
  return siteLocaleText[locale];
}

export function getSiteSeo(locale: SiteLocale = "en"): SiteSeoText {
  return siteSeoByLocale[locale];
}

/** Default English SEO — used by root layout metadata. */
export const siteSeo = siteSeoByLocale.en;

const sharedContact = {
  phone: "01791992313",
  email: "hilfulfuzulTalertal@gmail.com",
} as const;

/** Default English site text — used by server routes and legacy imports. */
export const siteConfig = {
  name: siteLocaleText.en.name,
  shortName: siteLocaleText.en.shortName,
  location: siteLocaleText.en.location,
  logoSrc: "/logo.png" as const,
  contact: {
    ...sharedContact,
    ...siteLocaleText.en.contact,
  },
  paymentBanner: {
    src: "/Group%201903.png" as const,
    alt: siteLocaleText.en.paymentBannerAlt,
    width: 720,
    height: 160,
  },
  /**
   * Optional override for receipt signature images. When `null`, the receipt
   * route auto-loads `public/signatures/chairman.png` and `receiver.png` if present.
   * Set a full `https://` URL to host elsewhere.
   */
  receiptSignatures: {
    chairmanPublicPath: null as string | null,
    receiverPublicPath: null as string | null,
  },
  footerQuickLinks: [
    { href: "/", key: "home" },
    ...mainNavItems,
    { href: "/admin", key: "admin" },
  ] satisfies NavItem[],
};
