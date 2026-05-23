"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
};

export function Reveal({ children, className, delay = 0, as: Tag = "div" }: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>({ once: true });

  return (
    <Tag
      ref={ref}
      className={cn(
        "motion-safe:opacity-0 motion-safe:translate-y-5",
        inView && "motion-safe:animate-reveal-up",
        className,
      )}
      style={inView ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

type RevealGroupProps = {
  children: ReactNode;
  className?: string;
  staggerMs?: number;
};

export function RevealGroup({ children, className, staggerMs = 70 }: RevealGroupProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ once: true });

  return (
    <div
      ref={ref}
      className={cn(
        "reveal-stagger",
        inView && "reveal-stagger-active",
        className,
      )}
      style={
        inView
          ? ({ ["--reveal-stagger" as string]: `${staggerMs}ms` } as CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
