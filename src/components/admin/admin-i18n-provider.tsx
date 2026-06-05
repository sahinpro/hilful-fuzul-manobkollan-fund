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
  ADMIN_LOCALE_COOKIE,
  ADMIN_LOCALE_STORAGE_KEY,
  DEFAULT_ADMIN_LOCALE,
  type AdminLocale,
} from "@/lib/i18n/admin-locale";
import { createAdminTranslator } from "@/lib/i18n/admin-translate";

type AdminI18nContextValue = {
  locale: AdminLocale;
  setLocale: (locale: AdminLocale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const AdminI18nContext = createContext<AdminI18nContextValue | null>(null);

function writeCookieLocale(locale: AdminLocale) {
  const maxAge = 60 * 60 * 24 * 400;
  document.cookie = `${ADMIN_LOCALE_COOKIE}=${locale};path=/;max-age=${maxAge};SameSite=Lax`;
}

function persistLocale(locale: AdminLocale) {
  writeCookieLocale(locale);
  try {
    localStorage.setItem(ADMIN_LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore quota / private mode */
  }
}

export function AdminI18nProvider({
  children,
  cookieLocale,
}: {
  children: ReactNode;
  cookieLocale: AdminLocale | null;
}) {
  const router = useRouter();
  const activeLocale = cookieLocale ?? DEFAULT_ADMIN_LOCALE;
  const [locale, setLocaleState] = useState<AdminLocale>(activeLocale);

  useLayoutEffect(() => {
    setLocaleState(activeLocale);
  }, [activeLocale]);

  const setLocale = useCallback(
    (next: AdminLocale) => {
      if (next === locale) return;
      setLocaleState(next);
      persistLocale(next);
      router.refresh();
    },
    [locale, router],
  );

  const t = useMemo(() => createAdminTranslator(locale), [locale]);
  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <AdminI18nContext.Provider value={value}>{children}</AdminI18nContext.Provider>;
}

export function useAdminI18n(): AdminI18nContextValue {
  const ctx = useContext(AdminI18nContext);
  if (!ctx) {
    throw new Error("useAdminI18n must be used within AdminI18nProvider");
  }
  return ctx;
}

/** For shared UI (e.g. theme toggle) that may render inside or outside admin routes. */
export function useOptionalAdminI18n(): AdminI18nContextValue | null {
  return useContext(AdminI18nContext);
}
