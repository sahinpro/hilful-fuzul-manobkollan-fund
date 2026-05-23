import { THEME_BOOT_SCRIPT } from "@/lib/theme/theme-boot-script";
import Script from "next/script";

/**
 * Blocking theme bootstrap for next-themes (React 19 safe — uses next/script, not raw <script> in head).
 */
export function ThemeBoot() {
  return (
    <Script
      id="theme-boot"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }}
    />
  );
}
