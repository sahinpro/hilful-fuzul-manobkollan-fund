"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";

type PageShellProps = {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  children: ReactNode;
};

export function PageShell({ title, subtitle, icon: Icon, children }: PageShellProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:py-14">
      <Reveal as="header" className="mb-8 border-b border-border pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          {Icon ? (
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <Icon className="size-6" aria-hidden />
            </span>
          ) : null}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-base text-muted-foreground md:text-lg">{subtitle}</p>
          </div>
        </div>
      </Reveal>
      {children}
    </section>
  );
}
