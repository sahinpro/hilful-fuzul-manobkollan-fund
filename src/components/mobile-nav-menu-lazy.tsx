"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const MobileNavMenu = dynamic(
  () => import("@/components/mobile-nav-menu").then((m) => m.MobileNavMenu),
  { ssr: false },
);

type MobileNavMenuLazyProps = ComponentProps<typeof MobileNavMenu>;

/** Loads drawer + Vaul only after the user opens the menu. */
export function MobileNavMenuLazy(props: MobileNavMenuLazyProps) {
  if (!props.open) return null;
  return <MobileNavMenu {...props} />;
}
