"use client";

import { useSiteI18n } from "@/components/site-i18n-provider";
import {
  Card,
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
import type {
  CommitteeChartDatum,
  ExpenseCategoryChartDatum,
} from "@/lib/finance/public-charts";
import { BarChart3, PieChart as PieChartGlyph } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

const committeeColors: Record<CommitteeChartDatum["id"], string> = {
  advisor: "var(--chart-1)",
  executive: "var(--chart-3)",
};

type FundOverviewChartsProps = {
  expenseByCategory: ExpenseCategoryChartDatum[];
  committeeSplit: CommitteeChartDatum[];
  expenseNote: string;
  committeeNote: string;
};

export function FundOverviewCharts({
  expenseByCategory,
  committeeSplit,
  expenseNote,
  committeeNote,
}: FundOverviewChartsProps) {
  const { t } = useSiteI18n();

  const expenseChartConfig = {
    percent: { label: "%", color: "var(--chart-2)" },
  } satisfies ChartConfig;

  const committeeChartConfig = Object.fromEntries(
    committeeSplit.map((entry) => [
      entry.id,
      { label: entry.name, color: committeeColors[entry.id] },
    ]),
  ) satisfies ChartConfig;

  const maxPercent = expenseByCategory.reduce(
    (max, row) => Math.max(max, row.percent),
    0,
  );
  const yMax = Math.max(10, Math.ceil(maxPercent / 10) * 10);

  const committeeTotal = committeeSplit.reduce((sum, row) => sum + row.value, 0);
  const committeeHighlight = committeeSplit.reduce(
    (best, row) => (row.value > best.value ? row : best),
    committeeSplit[0] ?? { id: "advisor" as const, name: "", value: 0 },
  );

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" aria-hidden />
            <CardTitle>{t("charts.expenseByCategoryTitle")}</CardTitle>
          </div>
          <CardDescription>{expenseNote}</CardDescription>
        </CardHeader>
        <CardContent>
          {expenseByCategory.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/15 px-4 text-center text-sm text-muted-foreground">
              {expenseNote}
            </div>
          ) : (
            <ChartContainer
              config={expenseChartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <BarChart
                data={expenseByCategory}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval={0}
                  tick={{ fontSize: 11 }}
                />
                <YAxis hide domain={[0, yMax]} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, _name, item) => (
                        <span className="font-mono tabular-nums">
                          {typeof value === "number" ? `${value}%` : String(value)}
                          {item?.payload?.amount != null
                            ? ` · ৳${Number(item.payload.amount).toLocaleString()}`
                            : null}
                        </span>
                      )}
                    />
                  }
                />
                <Bar dataKey="percent" radius={6} fill="var(--color-percent)" />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChartGlyph className="h-5 w-5 text-primary" aria-hidden />
            <CardTitle>{t("charts.committeeTitle")}</CardTitle>
          </div>
          <CardDescription>{committeeNote}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {committeeTotal === 0 ? (
            <div className="flex h-[250px] w-full items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/15 px-4 text-center text-sm text-muted-foreground">
              {committeeNote}
            </div>
          ) : (
            <ChartContainer
              config={committeeChartConfig}
              className="mx-auto aspect-square h-[250px] w-full max-w-[280px]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={committeeSplit.filter((row) => row.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={88}
                  strokeWidth={2}
                  stroke="var(--background)"
                >
                  {committeeSplit
                    .filter((row) => row.value > 0)
                    .map((entry) => (
                      <Cell key={entry.id} fill={committeeColors[entry.id]} />
                    ))}
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-sm font-semibold"
                          >
                            {committeeHighlight.name}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) + 18}
                            className="fill-muted-foreground text-xs"
                          >
                            {committeeHighlight.value}
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
