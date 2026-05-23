"use client";

import { MobileNavMenu } from "@/components/mobile-nav-menu";
import { useSiteI18n } from "@/components/site-i18n-provider";
import { cn } from "@/lib/utils";
import { Home, LayoutGrid, Menu, ScrollText, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const tabItems = [
  {
    href: "/",
    key: "tabHome" as const,
    Icon: Home,
    match: (path: string) => path === "/",
  },
  {
    href: "/about",
    key: "tabAbout" as const,
    Icon: Users,
    match: (path: string) => path.startsWith("/about"),
  },
  {
    href: "/transparency",
    key: "tabTransparency" as const,
    Icon: ScrollText,
    match: (path: string) => path.startsWith("/transparency"),
  },
  {
    href: "/activities",
    key: "tabActivities" as const,
    Icon: LayoutGrid,
    match: (path: string) => path.startsWith("/activities"),
  },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();
  const { t } = useSiteI18n();
  const [menuOpen, setMenuOpen] = useState(false);

  const menuActive =
    menuOpen ||
    pathname.startsWith("/annual-report") ||
    pathname.startsWith("/notices") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/receipt");

  return (
    <>
      <nav
        aria-label={t("mobile.tabBarAria")}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/85 pb-safe backdrop-blur-xl supports-backdrop-filter:bg-background/70 lg:hidden"
      >
        <div className="mx-auto grid h-17 max-w-lg grid-cols-5 items-stretch px-1">
          {tabItems.map(({ href, key, Icon, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "touch-manipulation flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[0.65rem] font-medium transition-[transform,color,background-color] duration-200 ease-spring motion-safe:active:scale-95",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full transition-[transform,background-color] duration-200 ease-spring",
                    active && "bg-primary/12 scale-105",
                  )}
                >
                  <Icon
                    className="size-5"
                    strokeWidth={active ? 2.25 : 2}
                    aria-hidden
                  />
                </span>
                <span className="max-w-full truncate leading-none">
                  {t(`mobile.${key}`)}
                </span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className={cn(
              "touch-manipulation flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[0.65rem] font-medium transition-[transform,color] duration-200 ease-spring motion-safe:active:scale-95",
              menuActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-label={t("mobile.openMenu")}
            aria-expanded={menuOpen}
          >
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-full transition-[transform,background-color] duration-200 ease-spring",
                menuActive && "bg-primary/12 scale-105",
              )}
            >
              <Menu
                className="size-5"
                strokeWidth={menuActive ? 2.25 : 2}
                aria-hidden
              />
            </span>
            <span className="max-w-full truncate leading-none">
              {t("mobile.tabMenu")}
            </span>
          </button>
        </div>
      </nav>

      <MobileNavMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
