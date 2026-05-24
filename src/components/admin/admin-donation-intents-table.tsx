"use client";

import { useAdminFinanceRefresh } from "@/components/admin/admin-finance-refresh-provider";
import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { formatAdminBdtAmount } from "@/lib/i18n/format-digits";
import { useCallback, useEffect, useState } from "react";

export type DonationIntentRow = {
  id: string;
  donor_full_name: string;
  donor_fathers_name: string | null;
  amount_bdt: string;
  payment_method: string;
  trx_id: string;
  status: string;
  source: string;
  created_at: string;
  expires_at: string;
};

export function AdminDonationIntentsTable() {
  const { t, locale } = useAdminI18n();
  const { bumpDataRefresh } = useAdminFinanceRefresh();
  const [rows, setRows] = useState<DonationIntentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch<{ intents: DonationIntentRow[] }>(
        "/api/admin/donation-intents?status=pending",
      );
      setRows(res.intents ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("donationIntents.loadFailed"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function confirm(id: string) {
    setActingId(id);
    setError(null);
    try {
      await adminFetch(`/api/admin/donation-intents/${id}/confirm`, { method: "POST" });
      await load();
      bumpDataRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("donationIntents.confirmFailed"));
    } finally {
      setActingId(null);
    }
  }

  async function reject(id: string) {
    setActingId(id);
    setError(null);
    try {
      await adminFetch(`/api/admin/donation-intents/${id}/reject`, { method: "POST" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("donationIntents.rejectFailed"));
    } finally {
      setActingId(null);
    }
  }

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleString(locale === "en" ? "en-GB" : "bn-BD");
    } catch {
      return iso;
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{t("donationIntents.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("donationIntents.subtitle")}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          {loading ? t("donationIntents.loading") : t("donationIntents.refresh")}
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 font-semibold">{t("donationIntents.colDonor")}</th>
              <th className="px-3 py-2 font-semibold">{t("donationIntents.colFathers")}</th>
              <th className="px-3 py-2 font-semibold">{t("donationIntents.colAmount")}</th>
              <th className="px-3 py-2 font-semibold">{t("donationIntents.colMethod")}</th>
              <th className="px-3 py-2 font-semibold">{t("donationIntents.colTrx")}</th>
              <th className="px-3 py-2 font-semibold">{t("donationIntents.colSubmitted")}</th>
              <th className="px-3 py-2 font-semibold">{t("donationIntents.colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="border-t border-border">
                <td colSpan={7} className="px-3 py-6 text-muted-foreground">
                  {t("donationIntents.loading")}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr className="border-t border-border">
                <td colSpan={7} className="px-3 py-6 text-muted-foreground">
                  {t("donationIntents.empty")}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-border align-top">
                  <td className="px-3 py-2">{row.donor_full_name}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.donor_fathers_name?.trim() || "—"}
                  </td>
                  <td className="px-3 py-2 font-medium">
                    {formatAdminBdtAmount(Number(row.amount_bdt), locale)}
                  </td>
                  <td className="px-3 py-2">{row.payment_method}</td>
                  <td className="px-3 py-2 font-mono text-xs">{row.trx_id}</td>
                  <td className="px-3 py-2 text-muted-foreground">{formatDate(row.created_at)}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={actingId === row.id}
                        onClick={() => void confirm(row.id)}
                      >
                        {actingId === row.id
                          ? t("donationIntents.confirming")
                          : t("donationIntents.confirm")}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={actingId === row.id}
                        onClick={() => void reject(row.id)}
                      >
                        {t("donationIntents.reject")}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
