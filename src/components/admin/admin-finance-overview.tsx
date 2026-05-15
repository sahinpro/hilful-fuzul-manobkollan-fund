"use client";

import { AdminActivityChart } from "@/components/admin/admin-activity-chart";
import { AdminFinanceExportToolbar } from "@/components/admin/admin-finance-export-toolbar";
import { useAdminFinanceRefresh } from "@/components/admin/admin-finance-refresh-provider";
import { AdminSectionKpiCards } from "@/components/admin/admin-section-kpi-cards";

export function AdminFinanceOverview() {
  const { refreshKey } = useAdminFinanceRefresh();

  return (
    <div className="flex flex-col gap-8 lg:gap-10">
      <AdminSectionKpiCards refreshKey={refreshKey} />
      <AdminFinanceExportToolbar />
      <section className="scroll-mt-24">
        <AdminActivityChart refreshKey={refreshKey} />
      </section>
    </div>
  );
}
