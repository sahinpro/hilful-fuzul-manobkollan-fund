"use client";

import { useSiteI18n } from "@/components/site-i18n-provider";
import { Button } from "@/components/ui/button";
import type { SiteLocale } from "@/lib/i18n/site-locale";

export function SiteLanguageSwitcher() {
  const { locale, setLocale, t } = useSiteI18n();

  function select(next: SiteLocale) {
    if (next !== locale) setLocale(next);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-lg border border-border bg-muted/40 p-0.5">
        {(
          [
            ["bn", "language.bn"],
            ["en", "language.en"],
          ] as const
        ).map(([code, labelKey]) => (
          <Button
            key={code}
            type="button"
            variant={locale === code ? "default" : "ghost"}
            size="sm"
            className="min-w-16 px-2.5 text-xs sm:min-w-20 sm:px-3 sm:text-sm"
            onClick={() => select(code)}
          >
            {t(labelKey)}
          </Button>
        ))}
      </div>
    </div>
  );
}
