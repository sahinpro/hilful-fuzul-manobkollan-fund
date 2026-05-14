"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { useOptionalAdminI18n } from "@/components/admin/admin-i18n-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Public header fallback (Bangla-first site chrome). */
const SITE_BN = {
  chooseAria: "থিম বেছে নিন",
  closeMenu: "মেনু বন্ধ করুন",
  light: "লাইট",
  dark: "ডার্ক",
  system: "সিস্টেম",
  systemDark: "সিস্টেম (ডার্ক)",
  systemLight: "সিস্টেম (লাইট)",
} as const;

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const admin = useOptionalAdminI18n();

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  const L = useMemo(() => {
    if (admin) {
      const { t } = admin;
      return {
        chooseAria: () => t("theme.chooseAria"),
        closeMenu: () => t("theme.closeMenu"),
        light: () => t("theme.light"),
        dark: () => t("theme.dark"),
        system: () => t("theme.system"),
        systemDark: () => t("theme.systemDark"),
        systemLight: () => t("theme.systemLight"),
      };
    }
    return {
      chooseAria: () => SITE_BN.chooseAria,
      closeMenu: () => SITE_BN.closeMenu,
      light: () => SITE_BN.light,
      dark: () => SITE_BN.dark,
      system: () => SITE_BN.system,
      systemDark: () => SITE_BN.systemDark,
      systemLight: () => SITE_BN.systemLight,
    };
  }, [admin]);

  if (!mounted) {
    return <div className="h-10 w-10 rounded-md border border-border bg-card" aria-hidden />;
  }

  const current =
    theme === "system"
      ? resolvedTheme === "dark"
        ? L.systemDark()
        : L.systemLight()
      : theme === "dark"
        ? L.dark()
        : L.light();

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="gap-2 px-3"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="sr-only">{L.chooseAria()}</span>
        {resolvedTheme === "dark" ? (
          <Moon className="size-4 shrink-0 sm:size-4.5" aria-hidden />
        ) : (
          <Sun className="size-4 shrink-0 sm:size-4.5" aria-hidden />
        )}
        <span className="hidden text-sm sm:inline">{current}</span>
      </Button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label={L.closeMenu()}
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-1 min-w-44 rounded-md border border-border bg-card p-1 text-card-foreground shadow-md"
          >
            <button
              type="button"
              role="menuitem"
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-accent",
                theme === "light" && "bg-accent",
              )}
              onClick={() => {
                setTheme("light");
                setOpen(false);
              }}
            >
              <Sun className="size-4 shrink-0" aria-hidden />
              {L.light()}
            </button>
            <button
              type="button"
              role="menuitem"
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-accent",
                theme === "dark" && "bg-accent",
              )}
              onClick={() => {
                setTheme("dark");
                setOpen(false);
              }}
            >
              <Moon className="size-4 shrink-0" aria-hidden />
              {L.dark()}
            </button>
            <button
              type="button"
              role="menuitem"
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-accent",
                theme === "system" && "bg-accent",
              )}
              onClick={() => {
                setTheme("system");
                setOpen(false);
              }}
            >
              <Monitor className="size-4 shrink-0" aria-hidden />
              {L.system()}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
