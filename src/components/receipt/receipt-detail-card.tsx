import { Button } from "@/components/ui/button";
import type { PublicLocale } from "@/lib/i18n/format-digits";
import { formatPublicBdt } from "@/lib/i18n/format-digits";
import type { PublicReceiptRecord } from "@/lib/receipt/public-receipt-lookup";
import { FileDown } from "lucide-react";
import Link from "next/link";

type ReceiptDetailCardProps = {
  record: PublicReceiptRecord;
  locale: PublicLocale;
  labels: {
    receiptNo: string;
    donorName: string;
    donorFathersName: string;
    amount: string;
    paymentMethod: string;
    receivedAt: string;
    printReceipt: string;
    backToSearch: string;
    verifiedNote: string;
    paymentLabel: (method: string) => string;
  };
};

function formatDate(iso: string, locale: PublicLocale): string {
  const tag = locale === "en" ? "en-GB" : "bn-BD";
  try {
    return new Date(iso).toLocaleDateString(tag, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function ReceiptDetailCard({ record, locale, labels }: ReceiptDetailCardProps) {
  const printHref = `/api/receipt/${encodeURIComponent(record.receiptNo)}/html`;

  return (
    <div className="ios-card space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
      <p className="text-sm text-emerald-700 dark:text-emerald-400">{labels.verifiedNote}</p>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {labels.receiptNo}
          </dt>
          <dd className="mt-1 font-mono text-lg font-bold">{record.receiptNo}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {labels.amount}
          </dt>
          <dd className="mt-1 text-lg font-bold tabular-nums">
            {formatPublicBdt(Number(record.amountBdt), locale)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {labels.donorName}
          </dt>
          <dd className="mt-1 font-medium">{record.donorName}</dd>
        </div>
        {record.donorFathersName ? (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {labels.donorFathersName}
            </dt>
            <dd className="mt-1 font-medium">{record.donorFathersName}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {labels.paymentMethod}
          </dt>
          <dd className="mt-1 font-medium">{labels.paymentLabel(record.paymentMethod)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {labels.receivedAt}
          </dt>
          <dd className="mt-1 font-medium">{formatDate(record.receivedAt, locale)}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-2 border-t border-border/70 pt-4">
        <Button
          variant="default"
          size="lg"
          className="gap-2"
          nativeButton={false}
          render={<a href={printHref} target="_blank" rel="noopener noreferrer" />}
        >
          <FileDown className="size-4" aria-hidden />
          {labels.printReceipt}
        </Button>
        <Button
          variant="outline"
          size="lg"
          nativeButton={false}
          render={<Link href="/receipt/verify" />}
        >
          {labels.backToSearch}
        </Button>
      </div>
    </div>
  );
}
