import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/admin/audit";
import { invalidatePublicFinanceCache } from "@/lib/cache/invalidate-public";
import { createServiceSupabase } from "@/lib/supabase/service";
import { expenseCreateBodySchema } from "@/lib/validation/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const supabase = createServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY or URL missing on server." },
      { status: 503 },
    );
  }

  const limit = Math.min(
    500,
    Math.max(1, Number(new URL(request.url).searchParams.get("limit")) || 200),
  );

  const { data: expenses, error } = await supabase
    .from("expenses")
    .select(
      "id, category, amount_bdt, description, beneficiary_note, spent_at, is_published, created_at, updated_at",
    )
    .order("spent_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ expenses: expenses ?? [] });
}

export async function POST(request: Request) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const supabase = createServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY or URL missing on server." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = expenseCreateBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const spentAt =
    data.spent_at && data.spent_at.trim() !== ""
      ? new Date(data.spent_at).toISOString()
      : new Date().toISOString();

  const insertRow = {
    category: data.category,
    amount_bdt: data.amount_bdt.toFixed(2),
    description: data.description,
    beneficiary_note: data.beneficiary_note ?? null,
    is_published: data.is_published,
    spent_at: spentAt,
  };

  const { data: expense, error } = await supabase
    .from("expenses")
    .insert(insertRow)
    .select("id, category, amount_bdt, spent_at, is_published")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await writeAuditLog(supabase, {
    action: "expense.create",
    resource_type: "expense",
    resource_id: expense.id,
    diff: {
      amount_bdt: expense.amount_bdt,
      category: expense.category,
    },
  });

  invalidatePublicFinanceCache();

  return NextResponse.json({ expense }, { status: 201 });
}
