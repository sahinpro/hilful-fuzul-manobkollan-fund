"use client";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type VolunteerJourneySlide = {
  id: string;
  imageSrc: string;
  title: string;
  caption: string;
  alt: string;
};

type HomeVolunteerJourneyProps = {
  slides: VolunteerJourneySlide[];
  sectionTitle: string;
  sectionSubtitle: string;
  orgLabel: string;
  logoAlt: string;
  /** Pre-translated labels, e.g. ["ধাপ ১", "ধাপ ২", …] */
  stepLabels: string[];
};

export function HomeVolunteerJourney({
  slides,
  sectionTitle,
  sectionSubtitle,
  orgLabel,
  logoAlt,
  stepLabels,
}: HomeVolunteerJourneyProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = useCallback((index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const child = el.children[index] as HTMLElement | undefined;
    if (!child) return;
    child.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || slides.length === 0) return;

    const onScroll = () => {
      const { scrollLeft, clientWidth } = el;
      const center = scrollLeft + clientWidth / 2;
      let closest = 0;
      let minDist = Infinity;
      Array.from(el.children).forEach((child, i) => {
        const node = child as HTMLElement;
        const childCenter = node.offsetLeft + node.offsetWidth / 2;
        const dist = Math.abs(center - childCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      setActiveIndex(closest);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="flex h-full min-h-[280px] flex-col bg-muted/15 lg:min-h-[420px]">
      <div className="border-b border-border/50 px-4 py-3 md:px-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {sectionTitle}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">{sectionSubtitle}</p>
      </div>

      <div className="relative flex-1 py-4">
        <div
          ref={scrollerRef}
          className={cn(
            "flex h-full snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
          aria-label={sectionTitle}
        >
          {slides.map((slide, index) => (
            <article
              key={slide.id}
              className="w-[82%] shrink-0 snap-center sm:w-[68%] md:w-[52%] lg:w-[88%]"
              aria-current={activeIndex === index ? "true" : undefined}
            >
              <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-border/60 shadow-md">
                <Image
                  src={slide.imageSrc}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 85vw, 45vw"
                />
                <div
                  className="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-black/25"
                  aria-hidden
                />

                {/* Branded logo badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full border border-white/15 bg-card/92 py-1 pr-3 pl-1 shadow-lg backdrop-blur-md">
                  <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                    <Image
                      src={siteConfig.logoSrc}
                      alt={logoAlt}
                      width={36}
                      height={36}
                      className="object-contain p-1"
                    />
                  </span>
                  <span className="max-w-[9rem] truncate text-xs font-bold leading-tight text-foreground">
                    {orgLabel}
                  </span>
                </div>

                <div className="absolute top-3 right-3 rounded-full bg-primary px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-primary-foreground shadow">
                  {stepLabels[index] ?? String(index + 1)}
                </div>

                <div className="absolute inset-x-0 bottom-0 p-4 pt-8">
                  <h3 className="text-base font-bold leading-snug text-white md:text-lg">
                    {slide.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-white/85 md:text-sm">
                    {slide.caption}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              className="absolute top-1/2 left-1 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-card/90 text-foreground shadow-md backdrop-blur-sm transition-opacity disabled:pointer-events-none disabled:opacity-0"
              aria-label="Previous"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => scrollToIndex(Math.min(slides.length - 1, activeIndex + 1))}
              disabled={activeIndex === slides.length - 1}
              className="absolute top-1/2 right-1 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-card/90 text-foreground shadow-md backdrop-blur-sm transition-opacity disabled:pointer-events-none disabled:opacity-0"
              aria-label="Next"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </>
        ) : null}
      </div>

      {slides.length > 1 ? (
        <div className="flex justify-center gap-1.5 px-4 pb-4" role="tablist" aria-label={sectionTitle}>
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              aria-label={slide.title}
              onClick={() => scrollToIndex(index)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                activeIndex === index ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/35",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
