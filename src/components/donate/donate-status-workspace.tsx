"use client";

import { Button } from "@/components/ui/button";
import { useSiteI18n } from "@/components/site-i18n-provider";
import { formatPublicBdt } from "@/lib/i18n/format-digits";
import type { PublicIntentStatus } from "@/lib/donate/intent-status";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type DonateStatusWorkspaceProps = {
  accessToken: string;
  configured: boolean;
};

export function DonateStatusWorkspace({ accessToken, configured }: DonateStatusWorkspaceProps) {
  const { locale, t } = useSiteI18n();
  const [data, setData] = useState<PublicIntentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!configured) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/donate/intent/${encodeURIComponent(accessToken)}`, {
        cache: "no-store",
      });
      const json = (await res.json().catch(() => ({}))) as PublicIntentStatus & {
        error?: string;
      };
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : t("pages.donate.status.loadError"));
        setData(null);
        return;
      }
      setData(json);
      setError(null);
    } catch {
      setError(t("pages.donate.status.loadError"));
    } finally {
      setLoading(false);
    }
  }, [accessToken, configured, t]);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (!data || data.status !== "pending") return;
    const id = window.setInterval(() => {
      void fetchStatus();
    }, 5000);
    return () => window.clearInterval(id);
  }, [data, fetchStatus]);

  const receiptUrl = `/api/donate/intent/${encodeURIComponent(accessToken)}/receipt-html`;

  if (!configured) {
    return (
      <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        {t("pages.donate.notConfigured")}
      </p>
    );
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" aria-hidden />
        <span>{t("pages.donate.status.loading")}</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </p>
    );
  }

  if (!data) return null;

  const amountLabel = formatPublicBdt(Number(data.amountBdt), locale);
  const methodLabel = t(
    `pages.donate.method.${data.paymentMethod as "bkash" | "nagad" | "rocket"}`,
  );

  return (
    <div className="ios-card mx-auto max-w-lg space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
      <StatusIcon status={data.status} />

      <div className="text-center">
        <h2 className="text-xl font-bold">{t(`pages.donate.status.title.${data.status}`)}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t(`pages.donate.status.body.${data.status}`)}
        </p>
      </div>

      <dl className="grid gap-2 rounded-xl border border-border/80 bg-muted/20 p-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{t("pages.donate.status.amount")}</dt>
          <dd className="font-semibold">{amountLabel}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{t("pages.donate.status.method")}</dt>
          <dd className="font-medium">{methodLabel}</dd>
        </div>
        {data.receiptNo ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t("pages.donate.status.receiptNo")}</dt>
            <dd className="font-mono text-xs font-semibold">{data.receiptNo}</dd>
          </div>
        ) : null}
      </dl>

      {data.status === "confirmed" ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            type="button"
            className="min-h-10"
            onClick={() => window.open(receiptUrl, "_blank", "noopener,noreferrer")}
          >
            {t("pages.donate.status.printReceipt")}
          </Button>
        </div>
      ) : data.status === "pending" ? (
        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {t("pages.donate.status.polling")}
        </p>
      ) : null}

      <p className="text-center text-sm">
        <a href="/donate" className="text-primary hover:underline">
          {t("pages.donate.backToDonate")}
        </a>
      </p>
    </div>
  );
}

function StatusIcon({ status }: { status: PublicIntentStatus["status"] }) {
  const className = "mx-auto size-12";
  if (status === "confirmed") {
    return <CheckCircle2 className={`${className} text-emerald-600`} aria-hidden />;
  }
  if (status === "rejected" || status === "expired") {
    return <XCircle className={`${className} text-destructive`} aria-hidden />;
  }
  return <Clock className={`${className} text-amber-600`} aria-hidden />;
}
