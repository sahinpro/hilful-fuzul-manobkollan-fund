import { NextResponse } from "next/server";

export function requireAdminApi(request: Request): NextResponse | null {
  const expected = process.env.ADMIN_API_TOKEN?.trim();
  if (!expected) {
    return NextResponse.json(
      { error: "Admin API disabled: set ADMIN_API_TOKEN in the server environment." },
      { status: 503 },
    );
  }

  const header = request.headers.get("authorization")?.trim();
  if (header !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
