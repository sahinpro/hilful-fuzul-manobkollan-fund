import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database";

type UpdateSessionOptions = {
  rewriteTo?: URL;
};

function createBaseResponse(request: NextRequest, rewriteTo?: URL) {
  if (rewriteTo) {
    return NextResponse.rewrite(rewriteTo, { request });
  }
  return NextResponse.next({ request });
}

export async function updateSession(request: NextRequest, options?: UpdateSessionOptions) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const rewriteTo = options?.rewriteTo;

  if (!url?.trim() || !anonKey?.trim()) {
    if (rewriteTo) {
      return NextResponse.rewrite(rewriteTo, { request });
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = createBaseResponse(request, rewriteTo);

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = createBaseResponse(request, rewriteTo);
        cookiesToSet.forEach(({ name, value, options: cookieOpts }) =>
          supabaseResponse.cookies.set(name, value, cookieOpts),
        );
      },
    },
  });

  await supabase.auth.getUser();

  return supabaseResponse;
}
