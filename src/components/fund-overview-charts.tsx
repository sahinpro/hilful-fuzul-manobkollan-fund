"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, PieChart as PieChartGlyph } from "lucide-react";
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

const expenseByCategory = [
  { category: "সেবা", percent: 40 },
  { category: "শিক্ষা", percent: 20 },
  { category: "চিকিৎসা", percent: 25 },
  { category: "মসজিদ/সমাজ", percent: 15 },
];

const committeeSplit = [
  { name: "advisor", value: 14 },
  { name: "executive", value: 3 },
];

const committeeColors: Record<string, string> = {
  advisor: "var(--chart-1)",
  executive: "var(--chart-3)",
};

export function FundOverviewCharts() {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" aria-hidden />
            <CardTitle>ব্যয়ের খাতভিত্তিক লক্ষ্য (শতাংশ)</CardTitle>
          </div>
          <CardDescription>
            নমুনা চিত্র — লাইভ হিসাব সংযুক্ত হলে প্রকৃত তথ্য দেখাবে।
          </CardDescription>
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
            <CardTitle>কমিটি বিন্যাস</CardTitle>
          </div>
          <CardDescription>উপদেষ্টা বনাম নির্বাহী (নমুনা)</CardDescription>
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
                    <Cell key={entry.name} fill={committeeColors[entry.name]} />
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
