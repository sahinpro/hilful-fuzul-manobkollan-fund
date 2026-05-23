import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PageSectionProps = {
  children: ReactNode;
  className?: string;
};

/** Logical block inside PageShell — each section staggers in via PageContentMotion. */
export function PageSection({ children, className }: PageSectionProps) {
  return <div className={cn(className)}>{children}</div>;
}
