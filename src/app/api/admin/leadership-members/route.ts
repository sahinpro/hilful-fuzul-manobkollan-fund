import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/admin/audit";
import { invalidateLeadershipCache } from "@/lib/cache/invalidate-public";
import { createServiceSupabase } from "@/lib/supabase/service";
import { leadershipCategorySchema, leadershipMemberCreateBodySchema } from "@/lib/validation/admin";
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

  const raw = new URL(request.url).searchParams.get("category");
  const cat = leadershipCategorySchema.safeParse(raw);
  if (!cat.success) {
    return NextResponse.json(
      { error: "Query `category` must be `advisor` or `executive`." },
      { status: 400 },
    );
  }

  const { data: members, error } = await supabase
    .from("leadership_members")
    .select("id, category, full_name, fathers_name, designation, sort_order, created_at")
    .eq("category", cat.data)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ members: members ?? [] });
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

  const parsed = leadershipMemberCreateBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const { data: member, error } = await supabase
    .from("leadership_members")
    .insert({
      category: data.category,
      full_name: data.full_name.trim(),
      fathers_name: data.fathers_name?.trim() ? data.fathers_name.trim() : null,
      designation: data.designation?.trim() ? data.designation.trim() : null,
      sort_order: data.sort_order ?? 0,
    })
    .select("id, category, full_name, fathers_name, designation, sort_order, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await writeAuditLog(supabase, {
    action: "leadership_member.create",
    resource_type: "leadership_member",
    resource_id: member.id,
    diff: { category: member.category, full_name: member.full_name } as unknown as Json,
  });

  invalidateLeadershipCache();

  return NextResponse.json({ member }, { status: 201 });
}
