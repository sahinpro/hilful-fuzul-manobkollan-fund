"use client";

import { siteImages } from "@/config/images";
import { heroVariants, iosSpringSoft } from "@/lib/motion/presets";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

export type HomeHeroProps = {
  badge: string;
  title: string;
  tagline: string;
  imageAlt: string;
};

export function HomeHero({ badge, title, tagline, imageAlt }: HomeHeroProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="ios-card overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      variants={heroVariants}
    >
      <div className="relative aspect-4/3 min-h-[220px] w-full sm:aspect-21/9 md:min-h-[260px]">
        <Image
          src={siteImages.heroMosque}
          alt={imageAlt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background/95 via-background/25 to-transparent" />
        <motion.div
          className="absolute inset-x-0 bottom-0 p-5 sm:p-8 md:p-10"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, ...iosSpringSoft }}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary md:text-sm">
            {badge}
          </p>
          <h1 className="mt-2 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            {tagline}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
