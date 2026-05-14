import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/auth";
import { createServiceSupabase } from "@/lib/supabase/service";
import { buildDonationReceiptPdf } from "@/lib/pdf/donation-receipt-pdf";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

const uuidParam = z.string().uuid();

type DonorRel = { full_name: string | null };

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdminApi(_request);
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
    .select("id, amount_bdt, payment_method, reference_note, received_at, donors (full_name)")
    .eq("id", donationId)
    .maybeSingle();

  if (dErr) {
    return NextResponse.json({ error: dErr.message }, { status: 400 });
  }
  if (!donation) {
    return NextResponse.json({ error: "Donation not found." }, { status: 404 });
  }

  const { data: receipt } = await supabase
    .from("receipts")
    .select("receipt_no")
    .eq("donation_id", donationId)
    .maybeSingle();

  const donors = donation.donors as DonorRel | DonorRel[] | null;
  const donorOne = Array.isArray(donors) ? donors[0] : donors;
  const donorName = donorOne?.full_name?.trim() || "—";

  const receiptNo =
    receipt?.receipt_no?.trim() ||
    `HF-${donationId.replace(/-/g, "").slice(0, 12).toUpperCase()}`;

  const pdfBytes = await buildDonationReceiptPdf({
    receiptNo,
    donorName,
    amountBdt: String(donation.amount_bdt),
    paymentMethod: donation.payment_method,
    referenceNote: donation.reference_note,
    receivedAtIso: donation.received_at,
    orgName: siteConfig.name,
    orgTagline: siteConfig.location,
  });

  const safeFile = receiptNo.replace(/[^\w.-]+/g, "_");
  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="donation-receipt-${safeFile}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
