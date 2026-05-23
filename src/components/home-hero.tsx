import { siteImages } from "@/config/images";
import Image from "next/image";

export type HomeHeroProps = {
  badge: string;
  title: string;
  tagline: string;
  imageAlt: string;
};

export function HomeHero({ badge, title, tagline, imageAlt }: HomeHeroProps) {
  return (
    <section className="motion-safe:animate-hero-enter overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
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
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary md:text-sm">{badge}</p>
          <h1 className="mt-2 max-w-3xl text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{tagline}</p>
        </div>
      </div>
    </section>
  );
}
