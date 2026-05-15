import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/admin/audit";
import { invalidatePublicFinanceCache } from "@/lib/cache/invalidate-public";
import { createServiceSupabase } from "@/lib/supabase/service";
import { expenseUpdateBodySchema } from "@/lib/validation/admin";
import type { Database, Json } from "@/types/database";

type ExpenseUpdate = Database["public"]["Tables"]["expenses"]["Update"];

export const dynamic = "force-dynamic";

const uuidParam = z.string().uuid();

const EXPENSE_SELECT =
  "id, category, amount_bdt, description, beneficiary_note, spent_at, is_published, created_at, updated_at";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const { id } = await context.params;
  const idParsed = uuidParam.safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid expense id." }, { status: 400 });
  }

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

  const parsed = expenseUpdateBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const patch: ExpenseUpdate = {};

  if (data.category !== undefined) {
    patch.category = data.category;
  }
  if (data.amount_bdt !== undefined) {
    patch.amount_bdt = data.amount_bdt.toFixed(2);
  }
  if (data.description !== undefined) {
    patch.description = data.description;
  }
  if (data.beneficiary_note !== undefined) {
    patch.beneficiary_note = data.beneficiary_note;
  }
  if (data.is_published !== undefined) {
    patch.is_published = data.is_published;
  }
  if (data.spent_at !== undefined && data.spent_at.trim() !== "") {
    patch.spent_at = new Date(data.spent_at).toISOString();
  }

  const { data: expense, error } = await supabase
    .from("expenses")
    .update(patch)
    .eq("id", idParsed.data)
    .select(EXPENSE_SELECT)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!expense) {
    return NextResponse.json({ error: "Expense not found." }, { status: 404 });
  }

  await writeAuditLog(supabase, {
    action: "expense.update",
    resource_type: "expense",
    resource_id: expense.id,
    diff: patch as unknown as Json,
  });

  invalidatePublicFinanceCache();

  return NextResponse.json({ expense });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const { id } = await context.params;
  const idParsed = uuidParam.safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid expense id." }, { status: 400 });
  }

  const supabase = createServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY or URL missing on server." },
      { status: 503 },
    );
  }

  const { data: removed, error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", idParsed.data)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!removed) {
    return NextResponse.json({ error: "Expense not found." }, { status: 404 });
  }

  await writeAuditLog(supabase, {
    action: "expense.delete",
    resource_type: "expense",
    resource_id: idParsed.data,
    diff: null,
  });

  invalidatePublicFinanceCache();

  return NextResponse.json({ ok: true });
}
