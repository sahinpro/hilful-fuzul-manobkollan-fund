import type { SiteLocale } from "@/lib/i18n/site-locale";
import siteBn from "@/messages/site/bn.json";
import siteEn from "@/messages/site/en.json";

const dictionaries: Record<SiteLocale, Record<string, unknown>> = {
  en: siteEn as Record<string, unknown>,
  bn: siteBn as Record<string, unknown>,
};

function getNested(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = vars[key];
    return v === undefined || v === null ? "" : String(v);
  });
}

export function createSiteTranslator(locale: SiteLocale) {
  const dict = dictionaries[locale] ?? dictionaries.en;

  function t(key: string, vars?: Record<string, string | number>): string {
    const raw = getNested(dict, key);
    if (typeof raw === "string") return interpolate(raw, vars);
    if (process.env.NODE_ENV === "development") {
      console.warn(`[site i18n] missing key: ${key} (locale ${locale})`);
    }
    return key;
  }

  return t;
}
