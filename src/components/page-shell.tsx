"use client";

import { PageContentMotion } from "@/components/page-content-motion";
import { Reveal } from "@/components/motion/reveal";
import type { ReactNode } from "react";

type PageShellProps = {
  title: string;
  subtitle: string;
  icon?: ReactNode;
  children: ReactNode;
  /** Stagger delay between content sections (ms) */
  staggerMs?: number;
};

export function PageShell({
  title,
  subtitle,
  icon,
  children,
  staggerMs = 75,
}: PageShellProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:py-14">
      <Reveal as="header" className="mb-8 border-b border-border pb-5" delay={0}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          {icon ? (
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              {title}
            </h1>
            <p className="mt-2 max-w-3xl text-base text-muted-foreground md:text-lg">
              {subtitle}
            </p>
          </div>
        </div>
      </Reveal>
      <PageContentMotion staggerMs={staggerMs}>{children}</PageContentMotion>
    </section>
  );
}
