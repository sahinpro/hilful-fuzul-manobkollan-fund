"use client";

import { useIsMobileNav } from "@/hooks/use-media-query";
import { pageSlideVariants } from "@/lib/motion/presets";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function SitePageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const isMobileNav = useIsMobileNav();

  if (reduceMotion || isMobileNav) {
    return <div key={pathname}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageSlideVariants}
        className="min-h-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
