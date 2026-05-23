"use client";

import { useEffect, useState } from "react";

/**
 * Subscribes to a CSS media query. Defaults to `false` until mounted (SSR-safe).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Matches `lg` breakpoint — mobile tab bar & light nav shell. */
export function useIsMobileNav(): boolean {
  return useMediaQuery("(max-width: 1023px)");
}
