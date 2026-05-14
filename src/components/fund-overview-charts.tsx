"use client";

import { useSiteI18n } from "@/components/site-i18n-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, PieChart as PieChartGlyph } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const EXPENSE_KEYS = ["service", "education", "health", "community"] as const;
const COMMITTEE_KEYS = ["advisor", "executive"] as const;

const committeeColors: Record<string, string> = {
  advisor: "var(--chart-1)",
  executive: "var(--chart-3)",
};

export function FundOverviewCharts() {
  const { t } = useSiteI18n();

  const expenseByCategory = useMemo(
    () =>
      EXPENSE_KEYS.map((key, i) => ({
        category: t(`charts.expense.${key}`),
        percent: [40, 20, 25, 15][i] ?? 0,
      })),
    [t],
  );

  const committeeSplit = useMemo(
    () =>
      COMMITTEE_KEYS.map((key, i) => ({
        id: key,
        name: t(`charts.committee.${key}`),
        value: [14, 3][i] ?? 0,
      })),
    [t],
  );

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" aria-hidden />
            <CardTitle>{t("charts.expenseByCategoryTitle")}</CardTitle>
          </div>
          <CardDescription>{t("charts.expenseByCategoryNote")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-4/3 w-full max-h-[320px] min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseByCategory} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="category" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis hide domain={[0, 50]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                />
                <Bar dataKey="percent" radius={6} fill="var(--chart-2)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChartGlyph className="h-5 w-5 text-primary" aria-hidden />
            <CardTitle>{t("charts.committeeTitle")}</CardTitle>
          </div>
          <CardDescription>{t("charts.committeeNote")}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="aspect-square w-full max-h-[280px] min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                />
                <Pie
                  data={committeeSplit}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={88}
                  strokeWidth={2}
                  stroke="var(--background)"
                >
                  {committeeSplit.map((entry) => (
                    <Cell key={entry.id} fill={committeeColors[entry.id]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
