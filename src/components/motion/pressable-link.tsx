"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type PressableLinkProps = ComponentProps<typeof Link>;

export function PressableLink({ className, ...props }: PressableLinkProps) {
  return (
    <Link
      className={cn(
        "touch-manipulation transition-[transform,box-shadow,border-color,background-color] duration-200 ease-spring",
        "motion-safe:active:scale-[0.98]",
        className,
      )}
      {...props}
    />
  );
}
