"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSiteI18n } from "@/components/site-i18n-provider";
import { getMfsDonationNumber } from "@/lib/donate/config";
import type { DonatePaymentMethod } from "@/lib/validation/donate";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DonateFormProps = {
  mode: "donate" | "claim";
  configured: boolean;
};

export function DonateForm({ mode, configured }: DonateFormProps) {
  const { t } = useSiteI18n();
  const router = useRouter();
  const mfsNumber = getMfsDonationNumber();

  const [donorName, setDonorName] = useState("");
  const [fathersName, setFathersName] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<DonatePaymentMethod>("bkash");
  const [trxId, setTrxId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prefix = mode === "claim" ? "pages.donate.claim" : "pages.donate";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!configured) {
      setError(t("pages.donate.notConfigured"));
      return;
    }

    const amountNum = Number(amount.replace(/,/g, "").trim());
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setError(t("pages.donate.errors.amount"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/donate/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donor_full_name: donorName.trim(),
          donor_fathers_name: fathersName.trim() || null,
          amount_bdt: amountNum,
          payment_method: paymentMethod,
          trx_id: trxId.trim(),
          source: mode === "claim" ? "claim" : "donate",
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string | { formErrors?: string[] };
        statusUrl?: string;
        accessToken?: string;
      };

      if (!res.ok) {
        const msg =
          typeof json.error === "string"
            ? json.error
            : t("pages.donate.errors.submit");
        setError(msg);
        return;
      }

      const token =
        json.accessToken ??
        (json.statusUrl ? json.statusUrl.split("/").pop() : null);
      if (!token) {
        setError(t("pages.donate.errors.submit"));
        return;
      }

      router.push(`/donate/status/${encodeURIComponent(token)}`);
    } catch {
      setError(t("pages.donate.errors.network"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="ios-card mx-auto max-w-lg space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
    >
      {!configured ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
          {t("pages.donate.notConfigured")}
        </p>
      ) : null}

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <p className="text-sm font-semibold text-primary">{t(`${prefix}.payTitle`)}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t(`${prefix}.paySteps`)}</p>
        {mfsNumber ? (
          <p className="mt-3 text-lg font-bold tracking-wide">{mfsNumber}</p>
        ) : null}
        <p className="mt-2 text-xs text-muted-foreground">{t("pages.donate.payNote")}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium" htmlFor="donor-name">
            {t("pages.donate.fields.name")}
          </label>
          <Input
            id="donor-name"
            required
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            className="mt-1.5 h-10"
            autoComplete="name"
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="fathers-name">
            {t("pages.donate.fields.fathersName")}
          </label>
          <Input
            id="fathers-name"
            value={fathersName}
            onChange={(e) => setFathersName(e.target.value)}
            className="mt-1.5 h-10"
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="amount">
            {t("pages.donate.fields.amount")}
          </label>
          <Input
            id="amount"
            required
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1.5 h-10"
            placeholder="500"
          />
        </div>
        <fieldset>
          <legend className="text-sm font-medium">{t("pages.donate.fields.method")}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["bkash", "nagad"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setPaymentMethod(key)}
                className={
                  paymentMethod === key
                    ? "rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    : "rounded-lg border border-border bg-muted/30 px-4 py-2 text-sm font-medium hover:bg-muted/50"
                }
              >
                {t(`pages.donate.method.${key}`)}
              </button>
            ))}
          </div>
        </fieldset>
        <div>
          <label className="text-sm font-medium" htmlFor="trx-id">
            {t("pages.donate.fields.trxId")}
          </label>
          <Input
            id="trx-id"
            required
            value={trxId}
            onChange={(e) => setTrxId(e.target.value)}
            className="mt-1.5 h-10 font-mono uppercase"
            autoComplete="off"
            spellCheck={false}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">{t("pages.donate.fields.trxHint")}</p>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="w-full min-h-10" disabled={submitting || !configured}>
        {submitting ? t("pages.donate.submitting") : t(`${prefix}.submit`)}
      </Button>

      {mode === "donate" ? (
        <p className="text-center text-sm text-muted-foreground">
          {t("pages.donate.claimLinkLead")}{" "}
          <a href="/donate/claim" className="font-medium text-primary hover:underline">
            {t("pages.donate.claimLink")}
          </a>
        </p>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          <a href="/donate" className="font-medium text-primary hover:underline">
            {t("pages.donate.backToDonate")}
          </a>
        </p>
      )}
    </form>
  );
}
