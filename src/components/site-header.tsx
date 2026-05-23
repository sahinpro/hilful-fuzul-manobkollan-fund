"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicNav } from "@/components/public-nav";
import { SiteLanguageSwitcher } from "@/components/site-language-switcher";
import { useSiteI18n } from "@/components/site-i18n-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { iosSpringSoft } from "@/lib/motion/presets";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export function SiteHeader() {
  const { t } = useSiteI18n();
  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const shadowOpacity = useTransform(scrollY, [0, 32], [0, 1]);
  const boxShadow = useTransform(
    shadowOpacity,
    (v) =>
      `0 1px 0 rgba(0,0,0,${v * 0.05}), 0 8px 28px -4px rgba(0,0,0,${v * 0.12})`,
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className={cn(
        "ios-header sticky top-0 z-40 border-b pt-safe transition-colors duration-300",
        scrolled
          ? "border-border/70 bg-background/90 backdrop-blur-2xl"
          : "border-transparent bg-background/75 backdrop-blur-xl",
      )}
      style={reduceMotion ? undefined : { boxShadow }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 md:h-16">
        <motion.div whileTap={reduceMotion ? undefined : { scale: 0.97 }} transition={iosSpringSoft}>
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2.5 rounded-xl py-1 pr-2 text-foreground hover:opacity-90"
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
        </motion.div>

        <PublicNav />

        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          <SiteLanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}
