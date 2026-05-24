import { getSiteLocaleText, siteConfig } from "@/config/site";
import { buildDonationReceiptHtmlDocument } from "@/lib/receipt/donation-receipt-html";
import { lookupPublicReceipt } from "@/lib/receipt/public-receipt-lookup";
import { publicAssetPathIfExists } from "@/lib/receipt/receipt-public-asset";
import {
  clientIpFromRequest,
  rateLimit,
  rateLimitResponse,
} from "@/lib/security/rate-limit";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ receiptNo: string }> };

const PRINT_LIMIT_PER_MIN = 25;
const PRINT_WINDOW_MS = 60_000;

export async function GET(request: Request, context: RouteContext) {
  const ip = clientIpFromRequest(request);
  const rl = rateLimit(`receipt-print:${ip}`, PRINT_LIMIT_PER_MIN, PRINT_WINDOW_MS);
  if (!rl.ok) {
    return rateLimitResponse(rl.retryAfterSec);
  }

  const { receiptNo } = await context.params;
  const decoded = decodeURIComponent(receiptNo).trim();
  if (!decoded) {
    return NextResponse.json({ error: "Receipt number required." }, { status: 400 });
  }

  const record = await lookupPublicReceipt(decoded);
  if (!record) {
    return NextResponse.json({ error: "Receipt not found." }, { status: 404 });
  }

  const siteBn = getSiteLocaleText("bn");
  const siteEn = getSiteLocaleText("en");
  const origin = new URL(request.url).origin;
  const html = buildDonationReceiptHtmlDocument(origin, {
    receiptNo: record.receiptNo,
    donorName: record.donorName,
    donorFathersName: record.donorFathersName,
    donorPhone: null,
    amountBdt: record.amountBdt,
    paymentMethod: record.paymentMethod,
    referenceNote: null,
    receivedAtIso: record.receivedAt,
    orgName: siteBn.name,
    orgTagline: `${siteBn.location} · ${siteBn.contact.addressLines.join(", ")}`,
    orgNameEn: siteEn.name,
    contactPhones: `${siteBn.contact.phoneLabel}: ${siteConfig.contact.phone}`,
    chairmanSignatureSrc:
      siteConfig.receiptSignatures.chairmanPublicPath ??
      publicAssetPathIfExists("signatures/chairman.png"),
    receiverSignatureSrc:
      siteConfig.receiptSignatures.receiverPublicPath ??
      publicAssetPathIfExists("signatures/receiver.png"),
  });

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, max-age=60",
    },
  });
}
