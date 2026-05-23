"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNavItems } from "@/config/site";
import { useSiteI18n } from "@/components/site-i18n-provider";
import { cn } from "@/lib/utils";

export function PublicNav() {
  const pathname = usePathname();
  const { t } = useSiteI18n();

  return (
    <nav className="hidden lg:flex lg:items-center lg:gap-1.5">
      {mainNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-2.5 py-2 text-sm font-medium transition-[background-color,color,transform] duration-200 ease-spring motion-safe:active:scale-[0.98]",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {t(`nav.${item.key}`)}
          </Link>
        );
      })}
    </nav>
  );
}
