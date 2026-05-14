"use client";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { MoreVertical } from "lucide-react";
import {
  Fragment,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type DonorRow = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
};

type DonorsTableProps = {
  refreshKey: number;
  embedded?: boolean;
  suppressEmbeddedToolbar?: boolean;
  toolbarRefreshNonce?: number;
  onEditInSheet?: (row: DonorRow) => void;
  onViewInSheet?: (row: DonorRow) => void;
  toolbarActions?: ReactNode;
};

export function AdminDonorsTable({
  refreshKey,
  embedded = false,
  suppressEmbeddedToolbar = false,
  toolbarRefreshNonce = 0,
  onEditInSheet,
  onViewInSheet,
  toolbarActions,
}: DonorsTableProps) {
  const { t } = useAdminI18n();
  const { bumpDataRefresh } = useAdminFinanceRefresh();
  const [rows, setRows] = useState<DonorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<DonorRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [draft, setDraft] = useState({ full_name: "", phone: "", email: "" });

  const useInlineEdit = !onEditInSheet;

  const load = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch<{ donors: DonorRow[] }>(
        "/api/admin/donors?limit=500",
      );
      setRows(res.donors ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("donorsTable.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const tid = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(tid);
  }, [load, refreshKey, toolbarRefreshNonce]);

  function openEdit(row: DonorRow) {
    setEditingId(row.id);
    setDraft({
      full_name: row.full_name,
      phone: row.phone ?? "",
      email: row.email ?? "",
    });
  }

  async function saveEdit(id: string) {
    setSaving(true);
    setError(null);
    try {
      await adminFetch(`/api/admin/donors/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          full_name: draft.full_name.trim(),
          phone: draft.phone.trim() === "" ? null : draft.phone.trim(),
          email: draft.email.trim(),
        }),
      });
      setEditingId(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("donorsTable.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeleteDonor() {
    if (!pendingDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await adminFetch(`/api/admin/donors/${pendingDelete.id}`, {
        method: "DELETE",
      });
      setPendingDelete(null);
      bumpDataRefresh();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("rowActions.deleteFailed"));
    } finally {
      setDeleting(false);
    }
  }

  const showLocalToolbar = !embedded || !suppressEmbeddedToolbar;

  const body = (
    <>
      {showLocalToolbar ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="default"
            className="min-h-9 px-3 text-sm sm:min-h-10"
            onClick={() => void load()}
            disabled={loading}
          >
            {loading ? t("donorsTable.loading") : t("donorsTable.refresh")}
          </Button>
        </div>
      ) : null}
      {embedded && suppressEmbeddedToolbar && toolbarActions ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {toolbarActions}
        </div>
      ) : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 font-medium">{t("donorsTable.name")}</th>
              <th className="px-3 py-2 font-medium">
                {t("donorsTable.phone")}
              </th>
              <th className="px-3 py-2 font-medium">
                {t("donorsTable.email")}
              </th>
              <th className="px-3 py-2 font-medium w-[72px] text-center">
                {t("donorsTable.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-muted-foreground" colSpan={4}>
                  {t("donorsTable.loading")}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-muted-foreground" colSpan={4}>
                  {t("donorsTable.empty")}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <Fragment key={row.id}>
                  <tr className="border-t border-border">
                    <td className="px-3 py-2font-medium">{row.full_name}</td>
                    <td className="px-3 py-2 align-top">
                      {row.phone?.trim() || "—"}
                    </td>
                    <td className="px-3 py-2 align-top">
                      {row.email?.trim() || "—"}
                    </td>
                    <td className="px-3 py-2text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          type="button"
                          nativeButton
                          aria-label={t("rowActions.moreAria")}
                          disabled={saving || deleting}
                          className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                        >
                          <MoreVertical className="size-4" aria-hidden />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-40">
                          {onViewInSheet ? (
                            <DropdownMenuItem
                              onClick={() => onViewInSheet(row)}
                            >
                              {t("rowActions.view")}
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem
                            onClick={() => {
                              if (onEditInSheet) onEditInSheet(row);
                              else openEdit(row);
                            }}
                          >
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
                  {useInlineEdit && editingId === row.id ? (
                    <tr className="border-t border-border bg-muted/40">
                      <td className="px-3 py-4" colSpan={4}>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          <div className="space-y-2 md:col-span-2 lg:col-span-3">
                            <Label htmlFor={`dn-${row.id}`}>
                              {t("donorsTable.name")}
                            </Label>
                            <Input
                              id={`dn-${row.id}`}
                              value={draft.full_name}
                              onChange={(e) =>
                                setDraft((p) => ({
                                  ...p,
                                  full_name: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`dp-${row.id}`}>
                              {t("donorsTable.phone")}
                            </Label>
                            <Input
                              id={`dp-${row.id}`}
                              value={draft.phone}
                              onChange={(e) =>
                                setDraft((p) => ({
                                  ...p,
                                  phone: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`de-${row.id}`}>
                              {t("donorsTable.email")}
                            </Label>
                            <Input
                              id={`de-${row.id}`}
                              type="email"
                              value={draft.email}
                              onChange={(e) =>
                                setDraft((p) => ({
                                  ...p,
                                  email: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="flex flex-wrap gap-2 md:col-span-2 lg:col-span-3">
                            <Button
                              type="button"
                              onClick={() => void saveEdit(row.id)}
                              disabled={saving || !draft.full_name.trim()}
                            >
                              {saving
                                ? t("donorsTable.saving")
                                : t("donorsTable.save")}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                              disabled={saving}
                            >
                              {t("donorsTable.cancel")}
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
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
                <AlertDialogTitle>
                  {t("rowActions.deleteDonorTitle")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("rowActions.deleteDonorDescription")}
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
                  onClick={() => void confirmDeleteDonor()}
                >
                  {deleting
                    ? t("rowActions.deleting")
                    : t("rowActions.confirmDelete")}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogViewport>
        </AlertDialogPortal>
      </AlertDialog>
    </>
  );

  if (embedded) {
    return <div className="space-y-3">{body}</div>;
  }

  return (
    <section className="scroll-mt-24">
      <Card>
        <CardHeader>
          <CardTitle>{t("donorsTable.sectionTitle")}</CardTitle>
          <CardDescription>
            {t("donorsTable.sectionDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">{body}</CardContent>
      </Card>
    </section>
  );
}
