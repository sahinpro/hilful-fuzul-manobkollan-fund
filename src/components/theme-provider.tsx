"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

/** next-themes is patched to omit its inline `<script>` (React 19 warns). Theme boot runs from `layout.tsx` via `THEME_BOOT_SCRIPT`. */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export { useTheme } from "next-themes";
