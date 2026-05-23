"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicNav } from "@/components/public-nav";
import { SiteLanguageSwitcher } from "@/components/site-language-switcher";
import { useSiteI18n } from "@/components/site-i18n-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { t } = useSiteI18n();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-300 ease-spring pt-safe",
        scrolled
          ? "border-border/80 bg-background/88 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-background/70 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 md:h-16">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-xl py-1 pr-2 text-foreground transition-opacity duration-200 ease-spring hover:opacity-90 motion-safe:active:scale-[0.98]"
          aria-label={t("site.homeAria")}
        >
          <Image
            src="/logo.png"
            alt={t("site.logoAlt")}
            width={40}
            height={40}
            className="size-9 shrink-0 object-contain md:size-10"
            priority
            unoptimized
          />
          <span className="truncate text-base font-semibold tracking-tight md:text-lg">
            {t("site.shortName")}
          </span>
        </Link>

        <PublicNav />

        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          <SiteLanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
