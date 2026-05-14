import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteI18nProvider } from "@/components/site-i18n-provider";
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
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </SiteI18nProvider>
  );
}
