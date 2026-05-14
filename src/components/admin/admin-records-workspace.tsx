"use client";

import { useState } from "react";
import {
  AdminDonationsTable,
  AdminExpensesTable,
  type DonationListRow,
  type ExpenseListRow,
} from "@/components/admin/admin-finance-data-tables";
import {
  AdminDonationFormSheet,
  AdminDonorFormSheet,
  AdminExpenseFormSheet,
} from "@/components/admin/admin-finance-form-sheets";
import { AdminDonorsTable, type DonorRow } from "@/components/admin/admin-donors-table";
import { useAdminFinanceRefresh } from "@/components/admin/admin-finance-refresh-provider";
import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AdminRecordsWorkspace() {
  const { t } = useAdminI18n();
  const { refreshKey, bumpDataRefresh } = useAdminFinanceRefresh();
  const [toolbarRefreshNonce, setToolbarRefreshNonce] = useState(0);

  const [donationOpen, setDonationOpen] = useState(false);
  const [donationRow, setDonationRow] = useState<DonationListRow | null>(null);
  const [donationViewOnly, setDonationViewOnly] = useState(false);

  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenseRow, setExpenseRow] = useState<ExpenseListRow | null>(null);
  const [expenseViewOnly, setExpenseViewOnly] = useState(false);

  const [donorOpen, setDonorOpen] = useState(false);
  const [donorRow, setDonorRow] = useState<DonorRow | null>(null);
  const [donorViewOnly, setDonorViewOnly] = useState(false);

  function handleToolbarRefresh() {
    bumpDataRefresh();
    setToolbarRefreshNonce((n) => n + 1);
  }

  function resetDonationSheet(open: boolean) {
    setDonationOpen(open);
    if (!open) {
      setDonationRow(null);
      setDonationViewOnly(false);
    }
  }

  function resetExpenseSheet(open: boolean) {
    setExpenseOpen(open);
    if (!open) {
      setExpenseRow(null);
      setExpenseViewOnly(false);
    }
  }

  function resetDonorSheet(open: boolean) {
    setDonorOpen(open);
    if (!open) {
      setDonorRow(null);
      setDonorViewOnly(false);
    }
  }

  return (
    <section className="scroll-mt-24 w-full min-w-0">
      <AdminDonationFormSheet
        open={donationOpen}
        onOpenChange={resetDonationSheet}
        editRow={donationRow}
        viewOnly={donationViewOnly}
      />
      <AdminExpenseFormSheet
        open={expenseOpen}
        onOpenChange={resetExpenseSheet}
        editRow={expenseRow}
        viewOnly={expenseViewOnly}
      />
      <AdminDonorFormSheet
        open={donorOpen}
        onOpenChange={resetDonorSheet}
        editRow={donorRow}
        viewOnly={donorViewOnly}
      />

      <Tabs defaultValue="donations" className="w-full min-w-0 gap-0">
        <Card className="w-full min-w-0 overflow-hidden shadow-sm">
          <CardHeader className="gap-3 border-b border-border bg-card pb-3 sm:gap-4 sm:pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1 space-y-1 text-left">
                <CardTitle className="text-xl">{t("workspace.title")}</CardTitle>
                <CardDescription>{t("workspace.description")}</CardDescription>
              </div>
              <div className="flex w-full shrink-0 flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end">
                <TabsList className="h-9 w-full shrink-0 justify-start sm:w-auto">
                  <TabsTrigger value="donations">{t("workspace.tabDonations")}</TabsTrigger>
                  <TabsTrigger value="expenses">{t("workspace.tabExpenses")}</TabsTrigger>
                  <TabsTrigger value="donors">{t("workspace.tabDonors")}</TabsTrigger>
                </TabsList>
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  className="min-h-9 px-3 text-sm sm:min-h-10"
                  onClick={handleToolbarRefresh}
                >
                  {t("workspace.refresh")}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-3 sm:pt-4">
            <TabsContent value="donations" className="mt-0 outline-none">
              <AdminDonationsTable
                refreshKey={refreshKey}
                embedded
                suppressEmbeddedToolbar
                toolbarRefreshNonce={toolbarRefreshNonce}
                toolbarActions={
                  <Button
                    type="button"
                    size="default"
                    className="min-h-9 px-4 text-sm sm:min-h-10"
                    onClick={() => {
                      setDonationRow(null);
                      setDonationViewOnly(false);
                      setDonationOpen(true);
                    }}
                  >
                    {t("donationForm.openSheet")}
                  </Button>
                }
                onViewInSheet={(row) => {
                  setDonationRow(row);
                  setDonationViewOnly(true);
                  setDonationOpen(true);
                }}
                onEditInSheet={(row) => {
                  setDonationRow(row);
                  setDonationViewOnly(false);
                  setDonationOpen(true);
                }}
              />
            </TabsContent>
            <TabsContent value="expenses" className="mt-0 outline-none">
              <AdminExpensesTable
                refreshKey={refreshKey}
                embedded
                suppressEmbeddedToolbar
                toolbarRefreshNonce={toolbarRefreshNonce}
                toolbarActions={
                  <Button
                    type="button"
                    size="default"
                    className="min-h-9 px-4 text-sm sm:min-h-10"
                    onClick={() => {
                      setExpenseRow(null);
                      setExpenseViewOnly(false);
                      setExpenseOpen(true);
                    }}
                  >
                    {t("expenseForm.openSheet")}
                  </Button>
                }
                onViewInSheet={(row) => {
                  setExpenseRow(row);
                  setExpenseViewOnly(true);
                  setExpenseOpen(true);
                }}
                onEditInSheet={(row) => {
                  setExpenseRow(row);
                  setExpenseViewOnly(false);
                  setExpenseOpen(true);
                }}
              />
            </TabsContent>
            <TabsContent value="donors" className="mt-0 outline-none">
              <AdminDonorsTable
                refreshKey={refreshKey}
                embedded
                suppressEmbeddedToolbar
                toolbarRefreshNonce={toolbarRefreshNonce}
                toolbarActions={
                  <Button
                    type="button"
                    size="default"
                    className="min-h-9 px-4 text-sm sm:min-h-10"
                    onClick={() => {
                      setDonorRow(null);
                      setDonorViewOnly(false);
                      setDonorOpen(true);
                    }}
                  >
                    {t("donorForm.openSheet")}
                  </Button>
                }
                onViewInSheet={(row) => {
                  setDonorRow(row);
                  setDonorViewOnly(true);
                  setDonorOpen(true);
                }}
                onEditInSheet={(row) => {
                  setDonorRow(row);
                  setDonorViewOnly(false);
                  setDonorOpen(true);
                }}
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </section>
  );
}
