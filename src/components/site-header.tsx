"use client";

import Image from "next/image";
import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { PublicNav } from "@/components/public-nav";
import { SiteLanguageSwitcher } from "@/components/site-language-switcher";
import { useSiteI18n } from "@/components/site-i18n-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const { t } = useSiteI18n();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <MobileNav />
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2.5 rounded-md py-1 pr-2 text-foreground transition-opacity hover:opacity-90"
            aria-label={t("site.homeAria")}
          >
            <Image
              src="/logo.png"
              alt={t("site.logoAlt")}
              width={40}
              height={40}
              className="h-9 w-9 shrink-0 object-contain"
              priority
              unoptimized
            />
            <span className="truncate text-base font-semibold tracking-tight md:text-lg">
              {t("site.shortName")}
            </span>
          </Link>
        </div>

        <PublicNav />

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          <SiteLanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
