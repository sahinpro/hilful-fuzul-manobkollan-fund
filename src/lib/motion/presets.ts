import type { Transition, Variants } from "framer-motion";

/** iOS-like snappy spring */
export const iosSpring = {
  type: "spring" as const,
  stiffness: 520,
  damping: 38,
  mass: 0.85,
};

/** Softer spring for large blocks */
export const iosSpringSoft = {
  type: "spring" as const,
  stiffness: 400,
  damping: 34,
  mass: 0.9,
};

/** Quick tap feedback */
export const iosTapSpring = {
  type: "spring" as const,
  stiffness: 680,
  damping: 42,
};

export const iosPageTransition: Transition = {
  ...iosSpring,
  duration: 0.45,
};

export const viewportOnce = {
  once: true,
  amount: 0.18,
  margin: "0px 0px -6% 0px",
} as const;

export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: iosSpringSoft,
  },
};

export function staggerContainer(stagger = 0.07, delayChildren = 0.04): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren,
      },
    },
  };
}

export const heroVariants: Variants = {
  hidden: { opacity: 0, scale: 1.04, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      ...iosSpringSoft,
      duration: 0.65,
    },
  },
};

export const homeSectionVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: iosSpringSoft,
  },
};

export const homePageTimeline: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.11,
      delayChildren: 0.06,
    },
  },
};

export const pageSlideVariants: Variants = {
  initial: { opacity: 0, x: 14, filter: "blur(4px)" },
  animate: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: iosPageTransition,
  },
  exit: {
    opacity: 0,
    x: -10,
    filter: "blur(2px)",
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  },
};

export const sheetItemVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      ...iosSpring,
      delay: 0.05 + index * 0.045,
    },
  }),
};

export const tabIndicatorTransition: Transition = {
  type: "spring",
  stiffness: 580,
  damping: 40,
};
