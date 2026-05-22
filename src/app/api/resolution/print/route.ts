import { NextResponse } from "next/server";
import { resolveExportCornerArtUrls } from "@/config/export-sheet-art";
import { siteConfig } from "@/config/site";
import type { SiteLocale } from "@/lib/i18n/site-locale";
import { createSiteTranslator } from "@/lib/i18n/site-translate";
import { buildCommitteeResolutionHtmlDocument } from "@/lib/resolution/committee-resolution-html";
import { getResolutionDocument } from "@/lib/resolution/resolution-document";
import { fetchLeadershipMembers } from "@/lib/site/leadership";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Resolution PDF is always full Bangla (text, digits, location). */
const PRINT_LOCALE = "bn" as const satisfies SiteLocale;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const t = createSiteTranslator(PRINT_LOCALE);
  const members = await fetchLeadershipMembers();
  const executives = members.filter((m) => m.category === "executive");
  const advisors = members.filter((m) => m.category === "advisor");
  const origin = url.origin;
  const cornerArt = resolveExportCornerArtUrls(origin);
  const doc = getResolutionDocument(PRINT_LOCALE, executives, advisors);

  const orgLocation = t("site.location");
  const resolvedLocation =
    orgLocation === "site.location" ? siteConfig.location : orgLocation;

  const html = buildCommitteeResolutionHtmlDocument({
    ...doc,
    origin,
    lang: "bn",
    logoPath: siteConfig.logoSrc,
    orgName: t("site.fullName"),
    orgLocation: resolvedLocation,
    printLabel: t("pages.about.resolutionPrint.print"),
    closeLabel: t("pages.about.resolutionPrint.close"),
    printHint: t("pages.about.resolutionPrint.hint"),
    documentFooter: t("pages.about.resolutionPrint.footer"),
    cornerArtLeftSrc: cornerArt.left,
    cornerArtLeftAlt: "ইসলামিক শোভা — বাম",
    cornerArtRightSrc: cornerArt.right,
    cornerArtRightAlt: "ইসলামিক শোভা — ডান",
  });

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
