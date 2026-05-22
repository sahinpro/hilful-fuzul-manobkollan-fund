import { Button } from "@/components/ui/button";
import type { SiteLocale } from "@/lib/i18n/site-locale";
import { FileDown } from "lucide-react";

export function AboutResolutionPrintLink(props: {
  locale: SiteLocale;
  label: string;
}) {
  const href = `/api/resolution/print?locale=${props.locale}`;

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      nativeButton={false}
      render={<a href={href} target="_blank" rel="noopener noreferrer" />}
    >
      <FileDown className="size-4" aria-hidden />
      {props.label}
    </Button>
  );
}
