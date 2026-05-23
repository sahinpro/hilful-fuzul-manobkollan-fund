import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PageSectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

/** Logical block inside PageShell — each section staggers in via PageContentMotion. */
export function PageSection({ children, className, id }: PageSectionProps) {
  return (
    <div id={id} className={cn(className)}>
      {children}
    </div>
  );
}
