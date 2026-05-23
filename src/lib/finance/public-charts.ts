import type { LeadershipMember } from "@/lib/site/leadership";

export type ExpenseCategoryChartDatum = {
  category: string;
  amount: number;
  percent: number;
};

export type ExpenseCategoryBreakdown = {
  rows: ExpenseCategoryChartDatum[];
  totalAmount: number;
};

export type CommitteeChartDatum = {
  id: "advisor" | "executive";
  name: string;
  value: number;
};

function parseMoney(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Aggregate published expenses by `category` (percent of total spend). */
export function aggregateExpenseByCategory(
  rows: { category: string; amount_bdt: string }[],
): ExpenseCategoryBreakdown {
  const totals = new Map<string, number>();

  for (const row of rows) {
    const category = row.category?.trim() || "অন্যান্য";
    totals.set(category, (totals.get(category) ?? 0) + parseMoney(row.amount_bdt));
  }

  const totalAmount = [...totals.values()].reduce((sum, n) => sum + n, 0);
  if (totalAmount <= 0) {
    return { rows: [], totalAmount: 0 };
  }

  const chartRows = [...totals.entries()]
    .map(([category, amount]) => ({
      category,
      amount,
      percent: Math.round((amount / totalAmount) * 1000) / 10,
    }))
    .sort((a, b) => b.amount - a.amount);

  return { rows: chartRows, totalAmount };
}

export function buildCommitteeChartData(
  members: LeadershipMember[],
  labelFor: (key: "advisor" | "executive") => string,
): CommitteeChartDatum[] {
  const counts = { advisor: 0, executive: 0 };

  for (const member of members) {
    if (member.category === "advisor") counts.advisor += 1;
    else if (member.category === "executive") counts.executive += 1;
  }

  return (["advisor", "executive"] as const).map((id) => ({
    id,
    name: labelFor(id),
    value: counts[id],
  }));
}
