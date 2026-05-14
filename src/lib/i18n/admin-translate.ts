import type { AdminLocale } from "@/lib/i18n/admin-locale";
import adminBn from "@/messages/admin/bn.json";
import adminEn from "@/messages/admin/en.json";

const dictionaries: Record<AdminLocale, Record<string, unknown>> = {
  en: adminEn as Record<string, unknown>,
  bn: adminBn as Record<string, unknown>,
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

export function createAdminTranslator(locale: AdminLocale) {
  const dict = dictionaries[locale] ?? dictionaries.bn;

  function t(key: string, vars?: Record<string, string | number>): string {
    const raw = getNested(dict, key);
    if (typeof raw === "string") return interpolate(raw, vars);
    if (process.env.NODE_ENV === "development") {
      console.warn(`[admin i18n] missing key: ${key} (locale ${locale})`);
    }
    return key;
  }

  return t;
}
