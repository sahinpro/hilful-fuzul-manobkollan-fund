"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function SitePageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="motion-safe:animate-page-enter">
      {children}
    </div>
  );
}
