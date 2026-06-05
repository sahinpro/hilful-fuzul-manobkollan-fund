"use client";

import {
  AdminLeadershipFormSheet,
  type LeadershipCategory,
  type LeadershipMemberRow,
} from "@/components/admin/admin-leadership-form-sheet";
import { useAdminFinanceRefresh } from "@/components/admin/admin-finance-refresh-provider";
import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogViewport,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { MoreVertical } from "lucide-react";
import { Fragment, useCallback, useEffect, useState } from "react";

type Props = {
  category: LeadershipCategory;
};

export function AdminLeadershipWorkspace({ category }: Props) {
  const { t } = useAdminI18n();
  const { refreshKey, bumpDataRefresh } = useAdminFinanceRefresh();
  const [rows, setRows] = useState<LeadershipMemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetRow, setSheetRow] = useState<LeadershipMemberRow | null>(null);
  const [pendingDelete, setPendingDelete] = useState<LeadershipMemberRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const pageTitle =
    category === "advisor" ? t("leadership.advisorsPageTitle") : t("leadership.executivesPageTitle");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch<{ members: LeadershipMemberRow[] }>(
        `/api/admin/leadership-members?category=${category}`,
      );
      setRows(res.members ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  function openCreate() {
    setSheetRow(null);
    setSheetOpen(true);
  }

  function openEdit(row: LeadershipMemberRow) {
    setSheetRow(row);
    setSheetOpen(true);
  }

  function handleSheetOpenChange(next: boolean) {
    setSheetOpen(next);
    if (!next) setSheetRow(null);
  }

  async function confirmDelete() {
    const row = pendingDelete;
    if (!row) return;
    setDeleting(true);
    try {
      await adminFetch(`/api/admin/leadership-members/${row.id}`, { method: "DELETE" });
      setPendingDelete(null);
      bumpDataRefresh();
    } catch {
      /* toast optional */
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Fragment>
      <AdminLeadershipFormSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        category={category}
        editRow={sheetRow}
      />

      <div className="flex flex-col gap-8 lg:gap-10">
        <Card>
          <CardHeader className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1 space-y-1.5 text-left">
              <CardTitle className="text-left">{pageTitle}</CardTitle>
              <CardDescription className="text-left">
                {t("leadership.pageDescription")}
              </CardDescription>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-start gap-2 sm:justify-end">
              <Button
                type="button"
                size="default"
                className="min-h-9 px-4 text-sm sm:min-h-10"
                onClick={openCreate}
              >
                {t("leadership.openSheet")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="min-w-[800px] w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="w-14 px-3 py-2 text-center font-medium">
                      {t("leadershipTable.sl")}
                    </th>
                    <th className="px-3 py-2 font-medium">{t("leadershipTable.name")}</th>
                    <th className="px-3 py-2 font-medium">{t("leadershipTable.fathersName")}</th>
                    <th className="px-3 py-2 font-medium">{t("leadershipTable.designation")}</th>
                    <th className="w-24 px-3 py-2 text-center font-medium tabular-nums">
                      {t("leadershipTable.sortOrder")}
                    </th>
                    <th className="w-[72px] px-3 py-2 text-center font-medium">
                      {t("leadershipTable.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading && rows.length === 0 ? (
                    <tr>
                      <td className="px-3 py-6 text-muted-foreground" colSpan={6}>
                        {t("leadershipTable.loading")}
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td className="px-3 py-6 text-muted-foreground" colSpan={6}>
                        {t("leadershipTable.empty")}
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, index) => (
                      <tr key={row.id} className="border-t border-border">
                        <td className="px-3 py-2 text-center tabular-nums text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="px-3 py-2 font-medium">{row.full_name}</td>
                        <td className="px-3 py-2">
                          {row.fathers_name?.trim() || "—"}
                        </td>
                        <td className="px-3 py-2 whitespace-normal">
                          {row.designation?.trim() || "—"}
                        </td>
                        <td className="px-3 py-2 text-center tabular-nums">{row.sort_order}</td>
                        <td className="px-3 py-2 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              type="button"
                              nativeButton
                              aria-label={t("rowActions.moreAria")}
                              disabled={deleting}
                              className="inline-flex size-9 items-center justify-center text-foreground transition disabled:pointer-events-none disabled:opacity-50"
                            >
                              <MoreVertical className="size-4" aria-hidden />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-40">
                              <DropdownMenuItem onClick={() => openEdit(row)}>
                                {t("rowActions.edit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setPendingDelete(row)}
                              >
                                {t("rowActions.delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={pendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogPortal>
          <AlertDialogBackdrop />
          <AlertDialogViewport>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("rowActions.deleteLeadershipTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("rowActions.deleteLeadershipDescription")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel type="button" disabled={deleting}>
                  {t("rowActions.cancel")}
                </AlertDialogCancel>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleting}
                  onClick={() => void confirmDelete()}
                >
                  {deleting ? t("rowActions.deleting") : t("rowActions.confirmDelete")}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogViewport>
        </AlertDialogPortal>
      </AlertDialog>
    </Fragment>
  );
}
