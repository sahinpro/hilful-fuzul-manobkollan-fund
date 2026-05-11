"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNavItems } from "@/config/site";
import { cn } from "@/lib/utils";

export function PublicNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex lg:items-center lg:gap-1.5">
      {mainNavItems.map((item) => {
        const isActive =
          pathname === item.href || pathname === decodeURIComponent(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
