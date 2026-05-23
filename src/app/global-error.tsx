"use client";

import { THEME_BOOT_SCRIPT } from "@/lib/theme/theme-boot-script";
import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="stylesheet" href="https://fonts.maateen.me/solaiman-lipi/font.css" />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="flex min-h-screen flex-col items-center justify-center bg-[oklch(0.99_0.01_145)] px-4 font-sans text-[oklch(0.2_0.02_145)] antialiased dark:bg-[oklch(0.16_0.02_145)] dark:text-[oklch(0.95_0.01_145)]"
      >
        <div className="w-full max-w-md rounded-2xl border border-[oklch(0.88_0.02_145)] bg-white p-8 text-center shadow-sm dark:border-[oklch(0.32_0.03_145)] dark:bg-[oklch(0.2_0.025_145)]">
          <p className="text-xs font-semibold uppercase tracking-widest text-[oklch(0.45_0.12_150)]">
            Error
          </p>
          <h1 className="mt-3 text-2xl font-bold">Something went wrong</h1>
          <p className="mt-3 text-sm text-[oklch(0.45_0.02_145)] dark:text-[oklch(0.72_0.02_145)]">
            A critical error occurred. Please reload the page.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 w-full rounded-xl bg-[oklch(0.45_0.12_150)] px-6 py-3 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
