import { NextResponse } from "next/server";
import { z } from "zod";
import { getSiteLocaleText, siteConfig } from "@/config/site";
import { requireAdminApi } from "@/lib/admin/auth";
import { ensureDonationReceipt } from "@/lib/receipt/ensure-donation-receipt";
import { buildDonationReceiptHtmlDocument } from "@/lib/receipt/donation-receipt-html";
import { publicAssetPathIfExists } from "@/lib/receipt/receipt-public-asset";
import { createServiceSupabase } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const uuidParam = z.string().uuid();

type DonorRel = {
  full_name: string | null;
  fathers_name: string | null;
  phone: string | null;
};

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const { id } = await context.params;
  const idParsed = uuidParam.safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid donation id." }, { status: 400 });
  }

  const supabase = createServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY or URL missing on server." },
      { status: 503 },
    );
  }

  const donationId = idParsed.data;

  const { data: donation, error: dErr } = await supabase
    .from("donations")
    .select(
      "id, amount_bdt, payment_method, reference_note, trx_id, received_at, donors (full_name, fathers_name, phone)",
    )
    .eq("id", donationId)
    .maybeSingle();

  if (dErr) {
    return NextResponse.json({ error: dErr.message }, { status: 400 });
  }
  if (!donation) {
    return NextResponse.json({ error: "Donation not found." }, { status: 404 });
  }

  const donors = donation.donors as DonorRel | DonorRel[] | null;
  const donorOne = Array.isArray(donors) ? donors[0] : donors;
  const donorName = donorOne?.full_name?.trim() || "—";
  const donorFathersName = donorOne?.fathers_name?.trim() || null;
  const donorPhone = donorOne?.phone?.trim() || null;

  const receiptNo = await ensureDonationReceipt(supabase, donationId);

  const siteBn = getSiteLocaleText("bn");
  const siteEn = getSiteLocaleText("en");
  const origin = new URL(request.url).origin;
  const html = buildDonationReceiptHtmlDocument(origin, {
    receiptNo,
    donorName,
    donorFathersName,
    donorPhone,
    amountBdt: String(donation.amount_bdt),
    paymentMethod: donation.payment_method,
    trxId: donation.trx_id,
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
