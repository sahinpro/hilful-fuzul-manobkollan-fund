"use client";

import { MobileNavMenu } from "@/components/mobile-nav-menu";
import { useSiteI18n } from "@/components/site-i18n-provider";
import { iosTapSpring, tabIndicatorTransition } from "@/lib/motion/presets";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
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
  const reduceMotion = useReducedMotion();

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
        className="ios-tab-bar fixed inset-x-0 bottom-0 z-50 lg:hidden"
      >
        <div className="ios-tab-bar-inner mx-auto grid h-17 max-w-lg grid-cols-5 items-stretch px-2 pb-safe pt-1">
          {tabItems.map(({ href, key, Icon, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative touch-manipulation flex flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-[0.625rem] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span className="relative flex size-10 items-center justify-center">
                  {active && !reduceMotion ? (
                    <motion.span
                      layoutId="ios-tab-pill"
                      className="absolute inset-0 rounded-2xl bg-primary/14"
                      transition={tabIndicatorTransition}
                    />
                  ) : active ? (
                    <span className="absolute inset-0 rounded-2xl bg-primary/14" />
                  ) : null}
                  <motion.span
                    animate={
                      reduceMotion
                        ? undefined
                        : { scale: active ? 1.05 : 1, y: active ? -1 : 0 }
                    }
                    transition={iosTapSpring}
                    className="relative z-10"
                  >
                    <Icon
                      className="size-[1.35rem]"
                      strokeWidth={active ? 2.35 : 1.85}
                      aria-hidden
                    />
                  </motion.span>
                </span>
                <span className="relative z-10 max-w-full truncate leading-none tracking-tight">
                  {t(`mobile.${key}`)}
                </span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className={cn(
              "relative touch-manipulation flex flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-[0.625rem] font-medium",
              menuActive ? "text-primary" : "text-muted-foreground",
            )}
            aria-label={t("mobile.openMenu")}
            aria-expanded={menuOpen}
          >
            <span className="relative flex size-10 items-center justify-center">
              {menuActive && !reduceMotion ? (
                <motion.span
                  layoutId="ios-tab-pill"
                  className="absolute inset-0 rounded-2xl bg-primary/14"
                  transition={tabIndicatorTransition}
                />
              ) : menuActive ? (
                <span className="absolute inset-0 rounded-2xl bg-primary/14" />
              ) : null}
              <motion.span
                whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                transition={iosTapSpring}
                className="relative z-10"
              >
                <Menu
                  className="size-[1.35rem]"
                  strokeWidth={menuActive ? 2.35 : 1.85}
                  aria-hidden
                />
              </motion.span>
            </span>
            <span className="relative z-10 max-w-full truncate leading-none tracking-tight">
              {t("mobile.tabMenu")}
            </span>
          </button>
        </div>
      </nav>

      <MobileNavMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
