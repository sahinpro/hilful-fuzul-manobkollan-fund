"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { mainNavItems } from "@/config/site";
import { SiteLanguageSwitcher } from "@/components/site-language-switcher";
import { useSiteI18n } from "@/components/site-i18n-provider";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useSiteI18n();

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={t("mobile.openMenu")}
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen ? (
        <div className="absolute inset-x-4 top-16 z-50 rounded-xl border border-border bg-card p-4 shadow-lg">
          <div className="mb-3 border-b border-border pb-3">
            <SiteLanguageSwitcher />
          </div>
          <div className="grid gap-1">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium",
                pathname === "/"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted hover:text-foreground",
              )}
            >
              {t("nav.home")}
            </Link>
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted hover:text-foreground",
                )}
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
