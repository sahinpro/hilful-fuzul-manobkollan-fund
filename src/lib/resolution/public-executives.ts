import { getResolutionDocument } from "@/lib/resolution/resolution-document";
import type { SiteLocale } from "@/lib/i18n/site-locale";

/** Executive committee rows from the static resolution (no DB). */
export function getPublicExecutiveRows(locale: SiteLocale) {
  return getResolutionDocument(locale, [], []).executiveRows;
}
