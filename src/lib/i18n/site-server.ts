import { cookies } from "next/headers";
import {
  DEFAULT_SITE_LOCALE,
  SITE_LOCALE_COOKIE,
  parseSiteLocaleCookie,
  type SiteLocale,
} from "@/lib/i18n/site-locale";
import { createSiteTranslator } from "@/lib/i18n/site-translate";

/** Server Components: read `site-locale` cookie and return translator + locale. */
export async function getSiteTranslator(): Promise<{
  locale: SiteLocale;
  t: ReturnType<typeof createSiteTranslator>;
}> {
  const cookieStore = await cookies();
  const locale =
    parseSiteLocaleCookie(cookieStore.get(SITE_LOCALE_COOKIE)?.value) ?? DEFAULT_SITE_LOCALE;
  return { locale, t: createSiteTranslator(locale) };
}
