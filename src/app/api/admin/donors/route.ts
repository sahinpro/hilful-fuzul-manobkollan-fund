import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/admin/audit";
import { createServiceSupabase } from "@/lib/supabase/service";
import { donorCreateBodySchema } from "@/lib/validation/admin";
import type { Json } from "@/types/database";

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
    Math.max(1, Number(new URL(request.url).searchParams.get("limit")) || 500),
  );

  const { data: donors, error } = await supabase
    .from("donors")
    .select("id, full_name, fathers_name, phone, email")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ donors: donors ?? [] });
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

  const parsed = donorCreateBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const { data: donor, error } = await supabase
    .from("donors")
    .insert({
      full_name: data.full_name,
      fathers_name: data.fathers_name?.trim() ? data.fathers_name.trim() : null,
      phone: data.phone ?? null,
      email: data.email ?? null,
      notes: data.notes ?? null,
    })
    .select("id, full_name, fathers_name, phone, email, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await writeAuditLog(supabase, {
    action: "donor.create",
    resource_type: "donor",
    resource_id: donor.id,
    diff: { full_name: donor.full_name } as unknown as Json,
  });

  return NextResponse.json({ donor }, { status: 201 });
}
