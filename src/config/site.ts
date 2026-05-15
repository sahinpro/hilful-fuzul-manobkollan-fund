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

export const siteSeo = {
  title: "Hilful Fuzul Manobkallyan Fund",
  titleTemplate: "%s | Hilful Fuzul Manobkallyan Fund",
  description:
    "Official website of Hilful Fuzul Manobkallyan Fund — transparent donations, expenses, and community welfare programmes in Sunamganj, Bangladesh.",
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
} as const;

export const siteConfig = {
  name: "Hilful Fuzul Manobkallyan Fund",
  shortName: "Hilful Fuzul",
  location: "Taleratal, Palash, Bishwambarpur, Sunamganj",
  logoSrc: "/logo.png" as const,
  contact: {
    phoneLabel: "Phone",
    phone: "017XX-XXXXXXX",
    emailLabel: "Email",
    email: "hilful.fuzul@example.com",
    addressLabel: "Address",
    addressLines: ["Taleratal, Palash, Bishwambarpur"],
  },
  paymentBanner: {
    src: "/Group%201903.png" as const,
    alt: "bKash, NexusPay, Nagad, Rocket — accepted payment methods",
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
