"use client";

import { useSiteI18n } from "@/components/site-i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  isReceiptExactQueryValid,
  isReceiptPrefixSearchValid,
  normalizeReceiptQuery,
} from "@/lib/receipt/receipt-number";
import type { PublicReceiptRecord } from "@/lib/receipt/public-receipt-lookup";
import { cn } from "@/lib/utils";
import { Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";

const PAYMENT_OPTIONS = [
  "all",
  "cash",
  "bank",
  "bkash",
  "nagad",
  "rocket",
  "other",
] as const;

type PaymentFilter = (typeof PAYMENT_OPTIONS)[number];

type ReceiptVerifyWorkspaceProps = {
  initialQuery?: string;
  initialPayment?: string;
  configured: boolean;
};

export function ReceiptVerifyWorkspace({
  initialQuery = "",
  initialPayment = "all",
  configured,
}: ReceiptVerifyWorkspaceProps) {
  const { t } = useSiteI18n();
  const router = useRouter();
  const formId = useId();
  const inputId = `${formId}-receipt-no`;

  const [query, setQuery] = useState(initialQuery);
  const [payment, setPayment] = useState<PaymentFilter>(
    PAYMENT_OPTIONS.includes(initialPayment as PaymentFilter)
      ? (initialPayment as PaymentFilter)
      : "all",
  );
  const [results, setResults] = useState<PublicReceiptRecord[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const runSearch = useCallback(
    async (q: string, pay: PaymentFilter) => {
      const normalized = normalizeReceiptQuery(q);
      if (!isReceiptPrefixSearchValid(normalized)) {
        setResults([]);
        setSearchError(null);
        return;
      }

      setSearching(true);
      setSearchError(null);
      try {
        const params = new URLSearchParams({
          q: normalized,
          payment: pay,
        });
        const res = await fetch(`/api/receipt/lookup?${params.toString()}`);
        if (res.status === 429) {
          setResults([]);
          setSearchError(t("pages.receipt.rateLimited"));
          return;
        }
        if (!res.ok) {
          setResults([]);
          setSearchError(t("pages.receipt.searchError"));
          return;
        }
        const data = (await res.json()) as { results: PublicReceiptRecord[] };
        setResults(data.results ?? []);
      } catch {
        setResults([]);
        setSearchError(t("pages.receipt.searchError"));
      } finally {
        setSearching(false);
      }
    },
    [t],
  );

  function paymentLabel(method: string): string {
    const key = method.toLowerCase();
    if (PAYMENT_OPTIONS.includes(key as PaymentFilter)) {
      return t(`pages.receipt.payment.${key}`);
    }
    return method;
  }

  useEffect(() => {
    if (!configured) return;
    const normalized = normalizeReceiptQuery(query);
    if (!isReceiptPrefixSearchValid(normalized)) {
      setResults([]);
      return;
    }

    const timer = window.setTimeout(() => {
      void runSearch(query, payment);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query, payment, configured, runSearch]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizeReceiptQuery(query);
    if (!normalized) return;
    router.push(
      `/receipt/${encodeURIComponent(normalized)}?payment=${encodeURIComponent(payment)}`,
    );
  }

  return (
    <div className="space-y-6">
      {!configured ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
          {t("pages.receipt.notConfigured")}
        </p>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="ios-card space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"
      >
        <div>
          <label htmlFor={inputId} className="text-sm font-medium">
            {t("pages.receipt.receiptNoLabel")}
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Input
              id={inputId}
              name="receiptNo"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("pages.receipt.inputPlaceholder")}
              autoComplete="off"
              spellCheck={false}
              className="h-11 min-h-11 text-base sm:flex-1"
            />
            <Button
              type="submit"
              size="lg"
              className="h-11 min-h-11 gap-2 sm:min-w-[8.5rem]"
              disabled={!configured || !isReceiptExactQueryValid(query)}
            >
              <Search className="size-4" aria-hidden />
              {t("pages.receipt.searchButton")}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{t("pages.receipt.inputHint")}</p>
        </div>

        <div>
          <p className="text-sm font-medium">{t("pages.receipt.filterPayment")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PAYMENT_OPTIONS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setPayment(key)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  payment === key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60",
                )}
              >
                {t(`pages.receipt.payment.${key}`)}
              </button>
            ))}
          </div>
        </div>
      </form>

      {searching ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {t("pages.receipt.searching")}
        </p>
      ) : null}

      {searchError ? (
        <p className="text-sm text-destructive" role="alert">
          {searchError}
        </p>
      ) : null}

      {results.length > 0 ? (
        <div className="ios-card overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <p className="border-b border-border/80 bg-muted/25 px-4 py-2.5 text-sm font-medium">
            {t("pages.receipt.resultsTitle")} ({results.length})
          </p>
          <ul className="divide-y divide-border/70">
            {results.map((row) => (
              <li key={row.receiptNo}>
                <Link
                  href={`/receipt/${encodeURIComponent(row.receiptNo)}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40 active:bg-muted/60"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold">{row.receiptNo}</p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">{row.donorName}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold tabular-nums">৳ {row.amountBdt}</p>
                    <p className="text-muted-foreground">{paymentLabel(row.paymentMethod)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!searching &&
      configured &&
      isReceiptPrefixSearchValid(query) &&
      results.length === 0 &&
      !searchError ? (
        <p className="text-sm text-muted-foreground">{t("pages.receipt.noResults")}</p>
      ) : null}
    </div>
  );
}
