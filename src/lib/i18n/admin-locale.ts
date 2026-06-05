export type AdminLocale = "en" | "bn";

export const DEFAULT_ADMIN_LOCALE: AdminLocale = "en";

export const ADMIN_LOCALE_STORAGE_KEY = "admin-locale";
export const ADMIN_LOCALE_COOKIE = "admin-locale";

export const ADMIN_LOCALES: readonly AdminLocale[] = ["en", "bn"] as const;

export function isAdminLocale(value: string | null | undefined): value is AdminLocale {
  return value === "en" || value === "bn";
}

export function parseAdminLocaleCookie(raw: string | undefined | null): AdminLocale | null {
  if (!raw) return null;
  const v = raw.trim();
  return isAdminLocale(v) ? v : null;
}

export function browserDefaultAdminLocale(): AdminLocale {
  if (typeof navigator === "undefined") return DEFAULT_ADMIN_LOCALE;
  const lang = navigator.language?.toLowerCase() ?? "";
  return lang.startsWith("bn") ? "bn" : DEFAULT_ADMIN_LOCALE;
}

export function adminDateLocaleTag(locale: AdminLocale): string {
  return locale === "bn" ? "bn-BD" : "en-GB";
}
