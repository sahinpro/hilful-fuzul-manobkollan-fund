import { requireAdminApi } from "@/lib/admin/auth";
import {
  confirmDonationIntent,
  ConfirmIntentError,
} from "@/lib/donate/confirm-intent";
import { createServiceSupabase } from "@/lib/supabase/service";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const uuidParam = z.string().uuid();

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const { id } = await context.params;
  const idParsed = uuidParam.safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  const supabase = createServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY or URL missing on server." },
      { status: 503 },
    );
  }

  try {
    const result = await confirmDonationIntent(supabase, idParsed.data);
    return NextResponse.json({
      success: true,
      donationId: result.donationId,
      receiptNo: result.receiptNo,
    });
  } catch (e) {
    if (e instanceof ConfirmIntentError) {
      const status =
        e.code === "NOT_FOUND"
          ? 404
          : e.code === "TRX_ALREADY_USED"
            ? 409
            : e.code === "EXPIRED"
              ? 410
              : 400;
      return NextResponse.json({ error: e.message, code: e.code }, { status });
    }
    const message = e instanceof Error ? e.message : "Confirm failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
