import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteI18nProvider } from "@/components/site-i18n-provider";
import { SitePageTransition } from "@/components/site-page-transition";
import { SITE_LOCALE_COOKIE, parseSiteLocaleCookie } from "@/lib/i18n/site-locale";

/**
 * Public marketing + transparency routes share one shell (header, footer, width rhythm).
 * Admin lives outside this group so it can use its own dashboard layout.
 */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const cookieLocale = parseSiteLocaleCookie(cookieStore.get(SITE_LOCALE_COOKIE)?.value);

  return (
    <SiteI18nProvider cookieLocale={cookieLocale}>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:pb-0">
          <SitePageTransition>{children}</SitePageTransition>
        </main>
        <SiteFooter />
        <MobileTabBar />
      </div>
    </SiteI18nProvider>
  );
}
