"use client";

import { homePageTimeline, homeSectionVariants } from "@/lib/motion/presets";
import { motion, useReducedMotion } from "framer-motion";
import { Children, type ReactNode } from "react";

type HomePageMotionProps = {
  children: ReactNode;
};

/**
 * Orchestrates the home page section timeline: hero → stats → commitment → quick links.
 */
export function HomePageMotion({ children }: HomePageMotionProps) {
  const reduceMotion = useReducedMotion();
  const sections = Children.toArray(children);

  return (
    <motion.div
      className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 md:space-y-14 md:py-14"
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      variants={homePageTimeline}
    >
      {sections.map((section, index) => (
        <motion.div key={index} variants={homeSectionVariants}>
          {section}
        </motion.div>
      ))}
    </motion.div>
  );
}
