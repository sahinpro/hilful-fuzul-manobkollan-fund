import { MobileTabBar } from "@/components/mobile-tab-bar";
import { SiteErrorView } from "@/components/site-error-view";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteI18nProvider } from "@/components/site-i18n-provider";
import { cookies } from "next/headers";
import { SITE_LOCALE_COOKIE, parseSiteLocaleCookie } from "@/lib/i18n/site-locale";

/** Global 404 — uses the same public chrome as marketing pages. */
export default async function RootNotFound() {
  const cookieStore = await cookies();
  const cookieLocale = parseSiteLocaleCookie(cookieStore.get(SITE_LOCALE_COOKIE)?.value);

  return (
    <SiteI18nProvider cookieLocale={cookieLocale}>
      <div className="ios-app-shell flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="ios-main flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
          <SiteErrorView variant="notFound" />
        </main>
        <SiteFooter />
        <MobileTabBar />
      </div>
    </SiteI18nProvider>
  );
}
