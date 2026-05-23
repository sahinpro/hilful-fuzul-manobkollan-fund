"use client";

import { PressableLink } from "@/components/motion/pressable-link";
import { RevealGroup } from "@/components/motion/reveal";
import { useSiteI18n } from "@/components/site-i18n-provider";
import { fadeUpItem, iosSpringSoft, staggerContainer } from "@/lib/motion/presets";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, FileQuestion, Home, RotateCcw } from "lucide-react";

type SiteErrorViewProps = {
  variant: "notFound" | "error";
  onRetry?: () => void;
};

export function SiteErrorView({ variant, onRetry }: SiteErrorViewProps) {
  const { t } = useSiteI18n();
  const reduceMotion = useReducedMotion();
  const isNotFound = variant === "notFound";
  const Icon = isNotFound ? FileQuestion : AlertTriangle;

  const title = isNotFound ? t("errors.notFound.title") : t("errors.generic.title");
  const description = isNotFound
    ? t("errors.notFound.description")
    : t("errors.generic.description");

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-16 text-center md:py-24">
      <motion.div
        className="w-full"
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        variants={staggerContainer(0.09, 0.04)}
      >
        <motion.div variants={fadeUpItem} className="flex justify-center">
          <span className="ios-card flex size-20 items-center justify-center rounded-3xl border border-border bg-card shadow-sm">
            <Icon className="size-10 text-primary" aria-hidden />
          </span>
        </motion.div>

        <motion.p
          variants={fadeUpItem}
          className="mt-6 text-xs font-semibold uppercase tracking-widest text-primary"
        >
          {isNotFound ? t("errors.notFound.badge") : t("errors.generic.badge")}
        </motion.p>

        <motion.h1
          variants={fadeUpItem}
          className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl"
        >
          {title}
        </motion.h1>

        <motion.p
          variants={fadeUpItem}
          className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base"
        >
          {description}
        </motion.p>

        <RevealGroup
          className={cn(
            "mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center",
            !isNotFound && "sm:items-center",
          )}
          staggerMs={60}
          delayChildrenMs={20}
        >
          <PressableLink
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm"
          >
            <Home className="size-4" aria-hidden />
            {t("errors.actions.home")}
          </PressableLink>

          {!isNotFound && onRetry ? (
            <motion.button
              type="button"
              onClick={onRetry}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              transition={iosSpringSoft}
              className="ios-card inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-sm hover:border-primary/50"
            >
              <RotateCcw className="size-4" aria-hidden />
              {t("errors.actions.retry")}
            </motion.button>
          ) : null}
        </RevealGroup>
      </motion.div>
    </section>
  );
}
