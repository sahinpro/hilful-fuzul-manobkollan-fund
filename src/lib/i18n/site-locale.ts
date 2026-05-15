export type SiteLocale = "en" | "bn";

export const SITE_LOCALE_STORAGE_KEY = "site-locale";
export const SITE_LOCALE_COOKIE = "site-locale";

export const SITE_LOCALES: readonly SiteLocale[] = ["en", "bn"] as const;

export function isSiteLocale(value: string | null | undefined): value is SiteLocale {
  return value === "en" || value === "bn";
}

export function parseSiteLocaleCookie(raw: string | undefined | null): SiteLocale | null {
  if (!raw) return null;
  const v = raw.trim();
  return isSiteLocale(v) ? v : null;
}

export function browserDefaultSiteLocale(): SiteLocale {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language?.toLowerCase() ?? "";
  return lang.startsWith("bn") ? "bn" : "en";
}
