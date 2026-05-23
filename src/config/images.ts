export const volunteerJourneySlideIds = [
  "serve",
  "support",
  "community",
  "education",
  "transparency",
] as const;

export type VolunteerJourneySlideId = (typeof volunteerJourneySlideIds)[number];

/** Unsplash URLs for the volunteer image journey (logo overlaid in UI). */
export const volunteerJourneyImages: Record<VolunteerJourneySlideId, string> = {
  serve:
    "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=85",
  support:
    "https://images.unsplash.com/photo-1593113598332-cf288c58b521?auto=format&fit=crop&w=1200&q=85",
  community:
    "https://images.unsplash.com/photo-1488521786991-0dca0a05048?auto=format&fit=crop&w=1200&q=85",
  education:
    "https://images.unsplash.com/photo-1509099838319-9f377c32aee3?auto=format&fit=crop&w=1200&q=85",
  transparency:
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85",
};

export const siteImages = {
  heroMosque: "/images/hero-mosque.webp" as const,
  bannerNature: "/images/banner-nature.webp" as const,
  /** @deprecated Use volunteer journey carousel in commitment section */
  commitmentCommunity: volunteerJourneyImages.serve,
};
