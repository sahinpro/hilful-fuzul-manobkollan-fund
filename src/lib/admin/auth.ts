import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";

const ADMIN_ROLES = new Set(["admin", "super_admin"]);

export function getUserRole(user: User | null | undefined): string | null {
  const role = user?.app_metadata?.role ?? user?.user_metadata?.role;
  return typeof role === "string" ? role : null;
}

export function isAdminUser(user: User | null | undefined): boolean {
  const role = getUserRole(user);
  return role != null && ADMIN_ROLES.has(role);
}

/**
 * Prefer Supabase session auth. Token auth remains as fallback for scripts.
 */
export async function requireAdminApi(request: Request): Promise<NextResponse | null> {
  const supabase = await createServerSupabase();
  if (supabase) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!error && user) {
      if (isAdminUser(user)) return null;
      return NextResponse.json({ error: "Forbidden: admin role required." }, { status: 403 });
    }
  }

  const expected = process.env.ADMIN_API_TOKEN?.trim();
  if (!expected) {
    return NextResponse.json(
      {
        error:
          "Unauthorized. Login as Supabase admin user or provide ADMIN_API_TOKEN bearer token.",
      },
      { status: 401 },
    );
  }

  const header = request.headers.get("authorization")?.trim();
  if (header !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
