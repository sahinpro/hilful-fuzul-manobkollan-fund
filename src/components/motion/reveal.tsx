"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";
import {
  Children,
  cloneElement,
  isValidElement,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  fadeUpItem,
  iosSpringSoft,
  staggerContainer,
  viewportOnce,
} from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
};

const motionTags = {
  div: motion.div,
  section: motion.section,
  header: motion.header,
  article: motion.article,
  aside: motion.aside,
} as const;

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const MotionTag =
    motionTags[Tag as keyof typeof motionTags] ?? motion.div;

  return (
    <MotionTag
      className={className}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={viewportOnce}
      variants={fadeUpItem}
      transition={{ ...iosSpringSoft, delay: delay / 1000 }}
    >
      {children}
    </MotionTag>
  );
}

type RevealGroupProps = {
  children: ReactNode;
  className?: string;
  /** Delay between each child in milliseconds */
  staggerMs?: number;
  /** Delay before the first child animates in milliseconds */
  delayChildrenMs?: number;
};

export function RevealGroup({
  children,
  className,
  staggerMs = 70,
  delayChildrenMs = 40,
}: RevealGroupProps) {
  const reduceMotion = useReducedMotion();
  const items = Children.toArray(children);

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={viewportOnce}
      variants={staggerContainer(staggerMs / 1000, delayChildrenMs / 1000)}
    >
      {items.map((child, index) => {
        if (!isValidElement(child)) {
          return (
            <motion.div key={index} variants={fadeUpItem}>
              {child}
            </motion.div>
          );
        }

        const el = child as ReactElement<{ className?: string }>;
        return (
          <motion.div key={el.key ?? index} variants={fadeUpItem}>
            {cloneElement(el, {
              className: cn(el.props.className),
            })}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

type MotionPressableProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
};

/** Wrapper for pressable cards with iOS-like scale feedback */
export function MotionPressable({
  children,
  className,
  ...props
}: MotionPressableProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      whileHover={reduceMotion ? undefined : { scale: 1.01 }}
      transition={{ type: "spring", stiffness: 680, damping: 42 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
