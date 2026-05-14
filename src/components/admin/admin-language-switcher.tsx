"use client";

import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import { Button } from "@/components/ui/button";
import type { AdminLocale } from "@/lib/i18n/admin-locale";

export function AdminLanguageSwitcher() {
  const { locale, setLocale, t } = useAdminI18n();

  function select(next: AdminLocale) {
    if (next !== locale) setLocale(next);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-lg border border-border bg-background p-0.5 shadow-xs">
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
            size="lg"
            className="min-w-22 px-4 text-sm"
            onClick={() => select(code)}
          >
            {t(labelKey)}
          </Button>
        ))}
      </div>
    </div>
  );
}
