import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Returns a root-relative URL like `/signatures/chairman.png` when the file
 * exists under `public/`. Used so receipts show signatures without editing
 * `siteConfig` every time.
 */
export function publicAssetPathIfExists(relativeFromPublic: string): string | null {
  const parts = relativeFromPublic.replace(/\\/g, "/").split("/").filter(Boolean);
  if (parts.length === 0) return null;
  const abs = join(process.cwd(), "public", ...parts);
  return existsSync(abs) ? `/${parts.join("/")}` : null;
}
