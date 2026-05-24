import { resolveReceiptSearchKind } from "@/lib/receipt/donor-name-search";
import {
  isReceiptExactQueryValid,
  normalizeReceiptQuery,
} from "@/lib/receipt/receipt-number";
import {
  lookupPublicReceipt,
  searchPublicReceipts,
  searchPublicReceiptsByDonorName,
} from "@/lib/receipt/public-receipt-lookup";
import {
  clientIpFromRequest,
  rateLimit,
  rateLimitResponse,
} from "@/lib/security/rate-limit";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PAYMENT_FILTER = new Set([
  "all",
  "cash",
  "bank",
  "bkash",
  "nagad",
  "rocket",
  "other",
]);

const LOOKUP_LIMIT_PER_MIN = 40;
const LOOKUP_WINDOW_MS = 60_000;

export async function GET(request: Request) {
  const ip = clientIpFromRequest(request);
  const rl = rateLimit(`receipt-lookup:${ip}`, LOOKUP_LIMIT_PER_MIN, LOOKUP_WINDOW_MS);
  if (!rl.ok) {
    return rateLimitResponse(rl.retryAfterSec);
  }

  const url = new URL(request.url);
  const no = url.searchParams.get("no")?.trim();
  const q = url.searchParams.get("q")?.trim();
  const paymentRaw = url.searchParams.get("payment")?.trim().toLowerCase() || "all";
  const payment = PAYMENT_FILTER.has(paymentRaw) ? paymentRaw : "all";

  try {
    if (no) {
      if (!isReceiptExactQueryValid(no)) {
        return NextResponse.json({ error: "Invalid receipt number." }, { status: 400 });
      }
      const record = await lookupPublicReceipt(no);
      if (!record) {
        return NextResponse.json({ found: false, record: null }, { status: 404 });
      }
      return NextResponse.json({ found: true, record });
    }

    const query = q ?? "";
    const kind = resolveReceiptSearchKind(query);
    if (!kind) {
      return NextResponse.json({ results: [], searchKind: null });
    }

    const paymentMethod = payment === "all" ? undefined : payment;
    const results =
      kind === "receipt"
        ? await searchPublicReceipts({
            query: normalizeReceiptQuery(query),
            paymentMethod,
            limit: 20,
          })
        : await searchPublicReceiptsByDonorName({
            query,
            paymentMethod,
            limit: 20,
          });

    return NextResponse.json({ results, searchKind: kind });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Lookup failed.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
