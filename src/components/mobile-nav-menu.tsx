"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNavItems, siteConfig } from "@/config/site";
import { SiteLanguageSwitcher } from "@/components/site-language-switcher";
import { useSiteI18n } from "@/components/site-i18n-provider";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

type MobileNavMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MobileNavMenu({ open, onOpenChange }: MobileNavMenuProps) {
  const pathname = usePathname();
  const { t } = useSiteI18n();

  const allLinks = [
    { href: "/", key: "home" as const },
    ...mainNavItems,
    { href: "/admin", key: "admin" as const },
  ];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="ios-sheet max-h-[88vh] rounded-t-[1.35rem] border-border/60 bg-card lg:bg-card/92 lg:backdrop-blur-2xl">
        <div className="ios-sheet-handle mx-auto mt-2 mb-1 h-1 w-10 rounded-full bg-foreground/20" />
        <DrawerHeader className="border-b border-border/50 pb-4 text-left">
          <DrawerTitle className="text-lg font-semibold tracking-tight">
            {t("mobile.menuTitle")}
          </DrawerTitle>
          <DrawerDescription className="text-sm">{siteConfig.shortName}</DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto overscroll-contain px-4 pb-safe pt-2">
          <div className="mb-4 rounded-2xl border border-border/60 bg-muted/35 p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("language.label")}
            </p>
            <SiteLanguageSwitcher />
          </div>

          <nav className={cn("grid gap-1.5 pb-4", open && "sheet-nav-open")}>
            {allLinks.map((item, index) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  onClick={() => onOpenChange(false)}
                  style={{ "--sheet-index": index } as CSSProperties}
                  className={cn(
                    "sheet-nav-item flex min-h-12 items-center rounded-2xl px-4 text-[1.05rem] font-medium transition-colors active:scale-[0.98]",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-muted/80 active:bg-muted",
                  )}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              );
            })}
          </nav>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
