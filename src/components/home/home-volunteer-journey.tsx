import Image from "next/image";

type HomeVolunteerJourneyProps = {
  imageSrc: string;
  title: string;
  caption: string;
  alt: string;
  sectionTitle: string;
  sectionSubtitle: string;
};

export function HomeVolunteerJourney({
  imageSrc,
  title,
  caption,
  alt,
  sectionTitle,
  sectionSubtitle,
}: HomeVolunteerJourneyProps) {
  return (
    <div className="flex h-full min-h-[280px] flex-col bg-muted/15 lg:min-h-[420px]">
      <div className="border-b border-border/50 px-4 py-3 md:px-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {sectionTitle}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">{sectionSubtitle}</p>
      </div>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <div className="relative aspect-4/3 min-h-[220px] flex-1 overflow-hidden rounded-xl border border-border/60 shadow-md">
          <Image
            src={imageSrc}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div
            className="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-black/25"
            aria-hidden
          />

          <div className="absolute inset-x-0 bottom-0 p-4 pt-8">
            <h3 className="text-base font-bold leading-snug text-white md:text-lg">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-white/85 md:text-sm">{caption}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
