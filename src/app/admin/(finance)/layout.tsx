import type { ReactNode } from "react";
import { AdminFinanceRefreshProvider } from "@/components/admin/admin-finance-refresh-provider";
import { financeAdminGate } from "@/lib/admin/finance-admin-gate";

export default async function AdminFinanceLayout({ children }: { children: ReactNode }) {
  const blocked = await financeAdminGate();
  if (blocked) return blocked;

  return <AdminFinanceRefreshProvider>{children}</AdminFinanceRefreshProvider>;
}
