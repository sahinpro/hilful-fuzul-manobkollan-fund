import { isDonateFlowConfigured } from "@/lib/donate/config";
import { resolveIntentStatus, type PublicIntentStatus } from "@/lib/donate/intent-status";
import { deriveReceiptNo } from "@/lib/receipt/receipt-number";
import {
  clientIpFromRequest,
  rateLimit,
  rateLimitResponse,
} from "@/lib/security/rate-limit";
import { createServiceSupabase } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const STATUS_LIMIT = 60;
const STATUS_WINDOW_MS = 60_000;

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(request: Request, context: RouteContext) {
  if (!isDonateFlowConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const ip = clientIpFromRequest(request);
  const rl = rateLimit(`donate-status:${ip}`, STATUS_LIMIT, STATUS_WINDOW_MS);
  if (!rl.ok) {
    return rateLimitResponse(rl.retryAfterSec);
  }

  const { token } = await context.params;
  const accessToken = token?.trim();
  if (!accessToken || accessToken.length < 16) {
    return NextResponse.json({ error: "Invalid token." }, { status: 400 });
  }

  const supabase = createServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Server unavailable." }, { status: 503 });
  }

  const { data: intent, error } = await supabase
    .from("donation_intents")
    .select(
      "id, status, amount_bdt, payment_method, donation_id, created_at, confirmed_at, expires_at",
    )
    .eq("access_token", accessToken)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!intent) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const status = resolveIntentStatus(intent);
  let receiptNo: string | null = null;

  if (status === "confirmed" && intent.donation_id) {
    const { data: receipt } = await supabase
      .from("receipts")
      .select("receipt_no")
      .eq("donation_id", intent.donation_id)
      .maybeSingle();

    receiptNo =
      receipt?.receipt_no?.trim() || deriveReceiptNo(intent.donation_id);
  }

  const payload: PublicIntentStatus = {
    status,
    amountBdt: String(intent.amount_bdt),
    paymentMethod: intent.payment_method,
    receiptNo,
    createdAt: intent.created_at,
    confirmedAt: intent.confirmed_at,
  };

  return NextResponse.json(payload);
}
