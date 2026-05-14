import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/admin/audit";
import { createServiceSupabase } from "@/lib/supabase/service";
import { donorUpdateBodySchema } from "@/lib/validation/admin";
import type { Database, Json } from "@/types/database";

type DonorUpdate = Database["public"]["Tables"]["donors"]["Update"];

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
    return NextResponse.json({ error: "Invalid donor id." }, { status: 400 });
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

  const parsed = donorUpdateBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const patch: DonorUpdate = {};

  if (data.full_name !== undefined) {
    patch.full_name = data.full_name;
  }
  if (data.phone !== undefined) {
    patch.phone = data.phone;
  }
  if (data.email !== undefined) {
    patch.email = data.email === "" ? null : data.email;
  }

  const { data: donor, error } = await supabase
    .from("donors")
    .update(patch)
    .eq("id", idParsed.data)
    .select("id, full_name, phone, email, created_at")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!donor) {
    return NextResponse.json({ error: "Donor not found." }, { status: 404 });
  }

  await writeAuditLog(supabase, {
    action: "donor.update",
    resource_type: "donor",
    resource_id: donor.id,
    diff: patch as unknown as Json,
  });

  return NextResponse.json({ donor });
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
    return NextResponse.json({ error: "Invalid donor id." }, { status: 400 });
  }

  const supabase = createServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY or URL missing on server." },
      { status: 503 },
    );
  }

  const { data: removed, error } = await supabase
    .from("donors")
    .delete()
    .eq("id", idParsed.data)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!removed) {
    return NextResponse.json({ error: "Donor not found." }, { status: 404 });
  }

  await writeAuditLog(supabase, {
    action: "donor.delete",
    resource_type: "donor",
    resource_id: idParsed.data,
    diff: null,
  });

  return NextResponse.json({ ok: true });
}
