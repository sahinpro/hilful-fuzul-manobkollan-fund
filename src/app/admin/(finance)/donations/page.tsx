"use client";

import { useState } from "react";
import { AdminDonationsTable, type DonationListRow } from "@/components/admin/admin-finance-data-tables";
import { AdminDonationFormSheet } from "@/components/admin/admin-finance-form-sheets";
import { useAdminFinanceRefresh } from "@/components/admin/admin-finance-refresh-provider";
import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import { Button } from "@/components/ui/button";

export default function AdminDonationsPage() {
  const { t } = useAdminI18n();
  const { refreshKey } = useAdminFinanceRefresh();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetRow, setSheetRow] = useState<DonationListRow | null>(null);
  const [sheetViewOnly, setSheetViewOnly] = useState(false);

  function openCreate() {
    setSheetRow(null);
    setSheetViewOnly(false);
    setSheetOpen(true);
  }

  function openEdit(row: DonationListRow) {
    setSheetRow(row);
    setSheetViewOnly(false);
    setSheetOpen(true);
  }

  function openView(row: DonationListRow) {
    setSheetRow(row);
    setSheetViewOnly(true);
    setSheetOpen(true);
  }

  function handleSheetOpenChange(next: boolean) {
    setSheetOpen(next);
    if (!next) {
      setSheetRow(null);
      setSheetViewOnly(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 lg:gap-10">
      <AdminDonationFormSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        editRow={sheetRow}
        viewOnly={sheetViewOnly}
      />
      <AdminDonationsTable
        refreshKey={refreshKey}
        onViewInSheet={openView}
        onEditInSheet={openEdit}
        listHeaderActions={
          <Button type="button" size="default" className="min-h-9 px-4 text-sm sm:min-h-10" onClick={openCreate}>
            {t("donationForm.openSheet")}
          </Button>
        }
      />
    </div>
  );
}
