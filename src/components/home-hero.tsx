import { siteImages } from "@/config/images";
import Image from "next/image";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative aspect-[21/9] min-h-[180px] w-full md:min-h-[260px]">
        <Image
          src={siteImages.heroMosque}
          alt="মসজিদ ও সম্প্রদায় — হিলফুল ফুজুলের কাজের প্রতীক"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <p className="text-xs font-medium uppercase tracking-wide text-primary md:text-sm">স্বাগতম</p>
          <h1 className="mt-2 max-w-3xl text-2xl font-bold leading-tight md:text-4xl">
            হিলফুল ফুজুল মানবকল্যাণ সংগঠন
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            দান, স্বচ্ছতা ও সমাজ কল্যাণ — এক প্ল্যাটফর্মে।
          </p>
        </div>
      </div>
    </section>
  );
}
