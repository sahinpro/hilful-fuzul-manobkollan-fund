import { isDonateFlowConfigured } from "@/lib/donate/config";
import { resolveIntentStatus } from "@/lib/donate/intent-status";
import { getSiteLocaleText, siteConfig } from "@/config/site";
import { buildDonationReceiptHtmlDocument } from "@/lib/receipt/donation-receipt-html";
import { ensureDonationReceipt } from "@/lib/receipt/ensure-donation-receipt";
import { publicAssetPathIfExists } from "@/lib/receipt/receipt-public-asset";
import {
  clientIpFromRequest,
  rateLimit,
  rateLimitResponse,
} from "@/lib/security/rate-limit";
import { createServiceSupabase } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RECEIPT_LIMIT = 30;
const RECEIPT_WINDOW_MS = 60_000;

type RouteContext = { params: Promise<{ token: string }> };

type DonorRel = {
  full_name: string | null;
  fathers_name: string | null;
  phone: string | null;
};

export async function GET(request: Request, context: RouteContext) {
  if (!isDonateFlowConfigured()) {
    return new NextResponse("Not configured.", { status: 503 });
  }

  const ip = clientIpFromRequest(request);
  const rl = rateLimit(`donate-receipt:${ip}`, RECEIPT_LIMIT, RECEIPT_WINDOW_MS);
  if (!rl.ok) {
    return rateLimitResponse(rl.retryAfterSec);
  }

  const { token } = await context.params;
  const accessToken = token?.trim();
  if (!accessToken || accessToken.length < 16) {
    return new NextResponse("Invalid token.", { status: 400 });
  }

  const supabase = createServiceSupabase();
  if (!supabase) {
    return new NextResponse("Server unavailable.", { status: 503 });
  }

  const { data: intent, error: intentErr } = await supabase
    .from("donation_intents")
    .select("id, status, donation_id, trx_id, expires_at")
    .eq("access_token", accessToken)
    .maybeSingle();

  if (intentErr || !intent) {
    return new NextResponse("Not found.", { status: 404 });
  }

  if (resolveIntentStatus(intent) !== "confirmed" || !intent.donation_id) {
    return new NextResponse("Receipt is not available until payment is confirmed.", {
      status: 403,
    });
  }

  const donationId = intent.donation_id;

  const { data: donation, error: dErr } = await supabase
    .from("donations")
    .select(
      "id, amount_bdt, payment_method, reference_note, trx_id, received_at, donors (full_name, fathers_name, phone)",
    )
    .eq("id", donationId)
    .maybeSingle();

  if (dErr || !donation) {
    return new NextResponse("Donation not found.", { status: 404 });
  }

  const donors = donation.donors as DonorRel | DonorRel[] | null;
  const donorOne = Array.isArray(donors) ? donors[0] : donors;

  const receiptNo = await ensureDonationReceipt(supabase, donationId);
  const siteBn = getSiteLocaleText("bn");
  const siteEn = getSiteLocaleText("en");
  const origin = new URL(request.url).origin;

  const html = buildDonationReceiptHtmlDocument(origin, {
    receiptNo,
    donorName: donorOne?.full_name?.trim() || "—",
    donorFathersName: donorOne?.fathers_name?.trim() || null,
    donorPhone: donorOne?.phone?.trim() || null,
    amountBdt: String(donation.amount_bdt),
    paymentMethod: donation.payment_method,
    trxId: donation.trx_id ?? intent.trx_id,
    referenceNote: donation.reference_note,
    receivedAtIso: donation.received_at,
    orgName: siteBn.name,
    orgTagline: siteBn.location,
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
      "Cache-Control": "no-store",
    },
  });
}
