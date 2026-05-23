"use client";

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
      <DrawerContent className="max-h-[88vh] rounded-t-2xl border-border/80 bg-card/95 backdrop-blur-xl">
        <DrawerHeader className="border-b border-border/60 pb-4 text-left">
          <DrawerTitle className="text-lg font-semibold">{t("mobile.menuTitle")}</DrawerTitle>
          <DrawerDescription className="text-sm">{siteConfig.shortName}</DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-safe pt-2">
          <div className="mb-4 rounded-xl border border-border/70 bg-muted/40 p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("language.label")}
            </p>
            <SiteLanguageSwitcher />
          </div>

          <nav className="grid gap-1 pb-4">
            {allLinks.map((item, index) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "sheet-nav-item flex min-h-12 items-center rounded-xl px-4 text-base font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-muted active:bg-muted/80",
                  )}
                  style={{ ["--sheet-index" as string]: String(index) }}
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
