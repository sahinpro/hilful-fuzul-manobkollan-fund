"use client";

import { SiteErrorView } from "@/components/site-error-view";
import { useEffect } from "react";

type SiteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function SiteError({ error, reset }: SiteErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <SiteErrorView variant="error" onRetry={reset} />;
}
