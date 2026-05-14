"use client";

import { useCallback, useEffect, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { adminDateLocaleTag } from "@/lib/i18n/admin-locale";
import { formatAdminBdtAmount, formatAdminInteger } from "@/lib/i18n/format-digits";

type StatsResponse = {
  counts: { donations: number; expenses: number; donors: number };
  totals: { donation_bdt: number; expense_bdt: number; net_bdt: number };
  totalsCapped?: boolean;
};

type Props = {
  refreshKey: number;
};

export function AdminSectionKpiCards({ refreshKey }: Props) {
  const { t, locale } = useAdminI18n();
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch<StatsResponse>("/api/admin/stats");
      setData(res);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : t("kpi.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const tid = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(tid);
  }, [load, refreshKey]);

  const dateLang = adminDateLocaleTag(locale);
  const net = data?.totals?.net_bdt ?? 0;
  const netPositive = net >= 0;

  const cards = [
    {
      key: "donations",
      desc: t("kpi.totalDonations"),
      title: loading ? "…" : formatAdminBdtAmount(data?.totals?.donation_bdt ?? 0, locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
      badge: (
        <Badge variant="outline" className="gap-1">
          <TrendingUp className="size-3.5" aria-hidden />
          {t("kpi.badgeInflow")}
        </Badge>
      ),
      footerLead: t("kpi.totalDonationsLead"),
      footerMuted: data?.totalsCapped ? t("kpi.approxFootnote") : t("kpi.totalDonationsHint"),
    },
    {
      key: "expenses",
      desc: t("kpi.totalExpenses"),
      title: loading ? "…" : formatAdminBdtAmount(data?.totals?.expense_bdt ?? 0, locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
      badge: (
        <Badge variant="outline" className="gap-1">
          <TrendingDown className="size-3.5" aria-hidden />
          {t("kpi.badgeOutflow")}
        </Badge>
      ),
      footerLead: t("kpi.totalExpensesLead"),
      footerMuted: data?.totalsCapped ? t("kpi.approxFootnote") : t("kpi.totalExpensesHint"),
    },
    {
      key: "donors",
      desc: t("kpi.donors"),
      title: loading ? "…" : formatAdminInteger(data?.counts?.donors ?? 0, locale),
      badge: (
        <Badge variant="outline" className="tabular-nums">
          {loading ? "—" : formatAdminInteger(data?.counts?.donations ?? 0, locale)} {t("kpi.recordsSuffix")}
        </Badge>
      ),
      footerLead: t("kpi.donorsLead"),
      footerMuted: t("kpi.donorsHint"),
    },
    {
      key: "net",
      desc: t("kpi.netBalance"),
      title: loading ? "…" : formatAdminBdtAmount(net, locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
      badge: (
        <Badge variant="outline" className="gap-1">
          {netPositive ? (
            <TrendingUp className="size-3.5" aria-hidden />
          ) : (
            <TrendingDown className="size-3.5" aria-hidden />
          )}
          {netPositive ? t("kpi.badgeNetPositive") : t("kpi.badgeNetNegative")}
        </Badge>
      ),
      footerLead: t("kpi.netLead"),
      footerMuted: t("kpi.netHint"),
    },
  ] as const;

  return (
    <section id="admin-overview" className="scroll-mt-24" lang={dateLang}>
      {error ? <p className="mb-4 text-sm text-rose-600">{error}</p> : null}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        {cards.map((c) => (
          <Card key={c.key} className="@container/card" data-slot="card">
            <CardHeader>
              <CardDescription>{c.desc}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {c.title}
              </CardTitle>
              <CardAction>{c.badge}</CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">{c.footerLead}</div>
              <div className="text-muted-foreground">{c.footerMuted}</div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
