import { type NextRequest } from "next/server";
import { getInternalPathnameForBanglaUrl } from "@/lib/routes/bangla-paths";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const internalPath = getInternalPathnameForBanglaUrl(request.nextUrl.pathname);
  if (internalPath) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = internalPath;
    return updateSession(request, { rewriteTo: rewriteUrl });
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
