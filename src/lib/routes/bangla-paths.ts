/**
 * Public Bangla URLs → internal ASCII app paths (Windows-safe `app/` segments).
 * Middleware applies these as rewrites so the address bar stays Bangla.
 */

const STATIC_MAP: ReadonlyArray<readonly [string, string]> = [
  ["/আমাদের-সম্পর্কে", "/about"],
  ["/কার্যক্রম", "/activities"],
  ["/স্বচ্ছতা", "/transparency"],
  ["/বার্ষিক-প্রতিবেদন", "/annual-report"],
  ["/নোটিশ", "/notices"],
  ["/অ্যাডমিন", "/admin"],
  ["/অ্যাডমিন/লগইন", "/admin/login"],
];

export function decodePathname(pathname: string): string {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

export function getInternalPathnameForBanglaUrl(pathname: string): string | null {
  const p = decodePathname(pathname);

  for (const [bangla, internal] of STATIC_MAP) {
    if (p === bangla) return internal;
  }

  const receiptPrefix = "/রসিদ/";
  if (p.startsWith(receiptPrefix)) {
    const rest = p.slice(receiptPrefix.length);
    if (!rest || rest.includes("/")) return null;
    return `/receipt/${rest}`;
  }

  return null;
}
