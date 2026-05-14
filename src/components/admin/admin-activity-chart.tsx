"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { formatAdminBdtAmount } from "@/lib/i18n/format-digits";
import { useIsMobile } from "@/hooks/use-mobile";

type TrendResponse = {
  days: number;
  points: { date: string; donations: number; expenses: number }[];
};

type Props = {
  refreshKey: number;
};

export function AdminActivityChart({ refreshKey }: Props) {
  const { t, locale } = useAdminI18n();
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");
  const [series, setSeries] = React.useState<TrendResponse["points"]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const chartConfig = {
    donations: {
      label: t("chart.donations"),
      color: "var(--chart-1)",
    },
    expenses: {
      label: t("chart.expenses"),
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  /** On narrow viewports we avoid the 90d range (was previously synced via an effect). */
  const displayTimeRange =
    isMobile && timeRange === "90d" ? "30d" : timeRange;

  const setTimeRangeClamped = React.useCallback(
    (next: string) => {
      setTimeRange(isMobile && next === "90d" ? "30d" : next);
    },
    [isMobile],
  );

  const daysParam =
    displayTimeRange === "7d" ? 7 : displayTimeRange === "30d" ? 30 : 90;

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch<TrendResponse>(`/api/admin/ledger-trend?days=${daysParam}`);
      setSeries(res.points ?? []);
    } catch (e) {
      setSeries([]);
      setError(e instanceof Error ? e.message : t("chart.loadError"));
    } finally {
      setLoading(false);
    }
  }, [daysParam, t]);

  React.useEffect(() => {
    const tid = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(tid);
  }, [load, refreshKey]);

  const dateLocale = locale === "bn" ? "bn-BD" : "en-GB";

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{t("chart.title")}</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">{t("chart.description")}</span>
          <span className="@[540px]/card:hidden">{t("chart.descriptionShort")}</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            multiple={false}
            value={displayTimeRange ? [displayTimeRange] : []}
            onValueChange={(value) => {
              setTimeRangeClamped(value[0] ?? "90d");
            }}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">{t("chart.range90")}</ToggleGroupItem>
            <ToggleGroupItem value="30d">{t("chart.range30")}</ToggleGroupItem>
            <ToggleGroupItem value="7d">{t("chart.range7")}</ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={displayTimeRange}
            onValueChange={(value) => {
              if (value !== null) {
                setTimeRangeClamped(value);
              }
            }}
          >
            <SelectTrigger
              className="flex w-44 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label={t("chart.rangeAria")}
            >
              <SelectValue placeholder={t("chart.range90")} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                {t("chart.range90")}
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                {t("chart.range30")}
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                {t("chart.range7")}
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}
        {loading && series.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            {t("chart.loading")}
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart accessibilityLayer data={series}>
              <defs>
                <linearGradient id="fillDonations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-donations)" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="var(--color-donations)" stopOpacity={0.08} />
                </linearGradient>
                <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-expenses)" stopOpacity={0.75} />
                  <stop offset="95%" stopColor="var(--color-expenses)" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={28}
                tickFormatter={(value) => {
                  const date = new Date(`${value}T12:00:00Z`);
                  return date.toLocaleDateString(dateLocale, {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      const date = new Date(`${value}T12:00:00Z`);
                      return date.toLocaleDateString(dateLocale, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                    formatter={(value, name) => (
                      <div className="flex w-full min-w-40 justify-between gap-3 text-xs">
                        <span className="text-muted-foreground">
                          {name === "donations"
                            ? t("chart.donations")
                            : name === "expenses"
                              ? t("chart.expenses")
                              : String(name)}
                        </span>
                        <span className="font-mono font-medium text-foreground tabular-nums">
                          {typeof value === "number"
                            ? formatAdminBdtAmount(value, locale, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })
                            : String(value)}
                        </span>
                      </div>
                    )}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="expenses"
                type="monotone"
                fill="url(#fillExpenses)"
                stroke="var(--color-expenses)"
                strokeWidth={2}
              />
              <Area
                dataKey="donations"
                type="monotone"
                fill="url(#fillDonations)"
                stroke="var(--color-donations)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
