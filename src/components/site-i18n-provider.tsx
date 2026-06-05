"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_SITE_LOCALE,
  SITE_LOCALE_COOKIE,
  SITE_LOCALE_STORAGE_KEY,
  type SiteLocale,
  browserDefaultSiteLocale,
  isSiteLocale,
} from "@/lib/i18n/site-locale";
import { createSiteTranslator } from "@/lib/i18n/site-translate";

type SiteI18nContextValue = {
  locale: SiteLocale;
  setLocale: (locale: SiteLocale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const SiteI18nContext = createContext<SiteI18nContextValue | null>(null);

function readStoredLocale(): SiteLocale | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(SITE_LOCALE_STORAGE_KEY);
    return isSiteLocale(v) ? v : null;
  } catch {
    return null;
  }
}

function writeCookieLocale(locale: SiteLocale) {
  const maxAge = 60 * 60 * 24 * 400;
  document.cookie = `${SITE_LOCALE_COOKIE}=${locale};path=/;max-age=${maxAge};SameSite=Lax`;
}

export function SiteI18nProvider({
  children,
  cookieLocale,
}: {
  children: ReactNode;
  cookieLocale: SiteLocale | null;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<SiteLocale>(() => cookieLocale ?? DEFAULT_SITE_LOCALE);

  useLayoutEffect(() => {
    void Promise.resolve().then(() => {
      const stored = readStoredLocale();
      if (stored) {
        setLocaleState(stored);
        writeCookieLocale(stored);
        return;
      }
      if (cookieLocale) {
        setLocaleState(cookieLocale);
        return;
      }
      setLocaleState(browserDefaultSiteLocale());
    });
  }, [cookieLocale]);

  useLayoutEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale === "en" ? "en" : "bn";
    }
  }, [locale]);

  const setLocale = useCallback(
    (next: SiteLocale) => {
      setLocaleState(next);
      try {
        localStorage.setItem(SITE_LOCALE_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      writeCookieLocale(next);
      router.refresh();
    },
    [router],
  );

  const t = useMemo(() => createSiteTranslator(locale), [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  );

  return <SiteI18nContext.Provider value={value}>{children}</SiteI18nContext.Provider>;
}

export function useSiteI18n() {
  const ctx = useContext(SiteI18nContext);
  if (!ctx) {
    throw new Error("useSiteI18n must be used within SiteI18nProvider");
  }
  return ctx;
}

/** Client components shared with admin (e.g. ThemeToggle) — null outside public site shell. */
export function useOptionalSiteI18n() {
  return useContext(SiteI18nContext);
}
