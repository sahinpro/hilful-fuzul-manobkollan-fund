/** Corner decorations for printable finance export sheets (`public/images/`). */
export const exportSheetCornerArt = {
  left: {
    path: "/images/left.png" as const,
    alt: "ইসলামিক শোভা",
  },
  right: {
    path: "/images/right.png" as const,
    alt: "ইসলামিক শোভা",
  },
} as const;

export function resolveExportCornerArtUrls(origin: string) {
  const base = origin.replace(/\/$/, "");
  return {
    left: `${base}${exportSheetCornerArt.left.path}`,
    right: `${base}${exportSheetCornerArt.right.path}`,
  };
}
