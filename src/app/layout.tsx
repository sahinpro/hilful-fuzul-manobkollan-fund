import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeBoot } from "@/components/theme-boot";
import { siteConfig, siteSeo } from "@/config/site";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: siteSeo.title,
    template: siteSeo.titleTemplate,
  },
  description: siteSeo.description,
  keywords: [...siteSeo.keywords],
  applicationName: siteConfig.shortName,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    siteName: siteConfig.name,
    title: siteSeo.title,
    description: siteSeo.description,
    images: [
      {
        url: siteConfig.logoSrc,
        width: 512,
        height: 512,
        alt: `${siteConfig.shortName} logo`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: siteSeo.title,
    description: siteSeo.description,
    images: [siteConfig.logoSrc],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className="h-full antialiased"
    >
      <head>
        <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="stylesheet" href="https://fonts.maateen.me/solaiman-lipi/font.css" />
      </head>
      <body suppressHydrationWarning className="min-h-full font-sans">
        <ThemeBoot />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider delay={0}>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
