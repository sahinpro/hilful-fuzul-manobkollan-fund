"use client";

import { iosTapSpring } from "@/lib/motion/presets";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { ComponentProps } from "react";

type PressableLinkProps = ComponentProps<typeof Link>;

export function PressableLink({ className, ...props }: PressableLinkProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="h-full"
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      whileHover={reduceMotion ? undefined : { y: -2 }}
      transition={iosTapSpring}
    >
      <Link
        className={cn(
          "ios-card touch-manipulation flex h-full flex-col transition-[box-shadow,border-color] duration-200",
          className,
        )}
        {...props}
      />
    </motion.div>
  );
}
