"use client";

import {
  fadeUpItem,
  staggerContainer,
  viewportOnce,
} from "@/lib/motion/presets";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { Children, type ReactNode } from "react";

type PageContentMotionProps = {
  children: ReactNode;
  className?: string;
  staggerMs?: number;
  delayChildrenMs?: number;
};

export function PageContentMotion({
  children,
  className,
  staggerMs = 75,
  delayChildrenMs = 45,
}: PageContentMotionProps) {
  const reduceMotion = useReducedMotion();
  const sections = Children.toArray(children);

  if (reduceMotion) {
    return <div className={cn("space-y-8", className)}>{sections}</div>;
  }

  return (
    <motion.div
      className={cn("space-y-8", className)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={staggerContainer(staggerMs / 1000, delayChildrenMs / 1000)}
    >
      {sections.map((section, index) => (
        <motion.div key={index} variants={fadeUpItem}>
          {section}
        </motion.div>
      ))}
    </motion.div>
  );
}
