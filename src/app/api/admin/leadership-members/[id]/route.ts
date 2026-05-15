import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/admin/audit";
import { invalidateLeadershipCache } from "@/lib/cache/invalidate-public";
import { createServiceSupabase } from "@/lib/supabase/service";
import { leadershipMemberUpdateBodySchema } from "@/lib/validation/admin";
import type { Database, Json } from "@/types/database";

type LeadershipUpdate = Database["public"]["Tables"]["leadership_members"]["Update"];

export const dynamic = "force-dynamic";

const uuidParam = z.string().uuid();

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = leadershipMemberUpdateBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const patch: LeadershipUpdate = {};

  if (data.full_name !== undefined) {
    patch.full_name = data.full_name.trim();
  }
  if (data.fathers_name !== undefined) {
    patch.fathers_name = data.fathers_name === "" ? null : data.fathers_name;
  }
  if (data.designation !== undefined) {
    patch.designation = data.designation === "" ? null : data.designation;
  }
  if (data.sort_order !== undefined) {
    patch.sort_order = data.sort_order;
  }

  const { data: member, error } = await supabase
    .from("leadership_members")
    .update(patch)
    .eq("id", idParsed.data)
    .select("id, category, full_name, fathers_name, designation, sort_order, created_at")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!member) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }

  await writeAuditLog(supabase, {
    action: "leadership_member.update",
    resource_type: "leadership_member",
    resource_id: member.id,
    diff: patch as unknown as Json,
  });

  invalidateLeadershipCache();

  return NextResponse.json({ member });
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
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  const supabase = createServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY or URL missing on server." },
      { status: 503 },
    );
  }

  const { data: removed, error } = await supabase
    .from("leadership_members")
    .delete()
    .eq("id", idParsed.data)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!removed) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }

  await writeAuditLog(supabase, {
    action: "leadership_member.delete",
    resource_type: "leadership_member",
    resource_id: idParsed.data,
    diff: null,
  });

  invalidateLeadershipCache();

  return NextResponse.json({ ok: true });
}
