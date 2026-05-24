import { createDonationIntentAccessToken } from "@/lib/donate/access-token";
import { isDonateFlowConfigured } from "@/lib/donate/config";
import { normalizeTrxId } from "@/lib/donate/normalize-trx";
import {
  clientIpFromRequest,
  rateLimit,
  rateLimitResponse,
} from "@/lib/security/rate-limit";
import { createServiceSupabase } from "@/lib/supabase/service";
import { donateIntentBodySchema } from "@/lib/validation/donate";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CREATE_LIMIT = 15;
const CREATE_WINDOW_MS = 60 * 60_000;

export async function POST(request: Request) {
  if (!isDonateFlowConfigured()) {
    return NextResponse.json(
      { error: "Online donation is not configured yet." },
      { status: 503 },
    );
  }

  const ip = clientIpFromRequest(request);
  const rl = rateLimit(`donate-intent:${ip}`, CREATE_LIMIT, CREATE_WINDOW_MS);
  if (!rl.ok) {
    return rateLimitResponse(rl.retryAfterSec);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = donateIntentBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const supabase = createServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Server database unavailable." }, { status: 503 });
  }

  const trxId = normalizeTrxId(data.trx_id);

  const { data: dupIntent } = await supabase
    .from("donation_intents")
    .select("id, status")
    .eq("payment_method", data.payment_method)
    .eq("trx_id", trxId)
    .in("status", ["pending", "confirmed"])
    .maybeSingle();

  if (dupIntent) {
    return NextResponse.json(
      { error: "এই TrxID ইতিমধ্যে জমা দেওয়া হয়েছে।" },
      { status: 409 },
    );
  }

  const { data: dupDonation } = await supabase
    .from("donations")
    .select("id")
    .eq("payment_method", data.payment_method)
    .eq("trx_id", trxId)
    .maybeSingle();

  if (dupDonation) {
    return NextResponse.json(
      { error: "এই TrxID ইতিমধ্যে নথিভুক্ত আছে।" },
      { status: 409 },
    );
  }

  const accessToken = createDonationIntentAccessToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60_000).toISOString();

  const { data: intent, error } = await supabase
    .from("donation_intents")
    .insert({
      donor_full_name: data.donor_full_name,
      donor_fathers_name: data.donor_fathers_name?.trim() || null,
      amount_bdt: data.amount_bdt.toFixed(2),
      payment_method: data.payment_method,
      trx_id: trxId,
      source: data.source,
      access_token: accessToken,
      expires_at: expiresAt,
    })
    .select("id, access_token, status, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    {
      intentId: intent.id,
      accessToken: intent.access_token,
      status: intent.status,
      statusUrl: `/donate/status/${intent.access_token}`,
    },
    { status: 201 },
  );
}
