"use client";

import { Fragment, useCallback, useEffect, useState, type ReactNode } from "react";
import { FileDown, MoreVertical } from "lucide-react";
import { AdminDatetimePicker, isoToDatetimeLocal } from "@/components/admin/admin-datetime-picker";
import { useAdminFinanceRefresh } from "@/components/admin/admin-finance-refresh-provider";
import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import {
  AdminDonorSelect,
  AdminExpenseCategorySelect,
  AdminPaymentMethodSelect,
} from "@/components/admin/admin-form-selects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { adminDateLocaleTag } from "@/lib/i18n/admin-locale";
import { formatAdminBdtAmount } from "@/lib/i18n/format-digits";

type DonorOption = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
};

type DonorEmbed = {
  full_name: string;
  phone: string | null;
  email: string | null;
};

export type DonationListRow = {
  id: string;
  donor_id: string | null;
  amount_bdt: string;
  payment_method: string;
  reference_note: string | null;
  received_at: string;
  is_published: boolean;
  created_at: string;
  donors: DonorEmbed | DonorEmbed[] | null;
};

function donorLabel(row: DonationListRow): string {
  const rel = row.donors;
  if (rel == null) return "—";
  const one = Array.isArray(rel) ? rel[0] : rel;
  if (!one?.full_name) return "—";
  return one.full_name;
}

type DonationsTableProps = {
  refreshKey: number;
  /** When true, render table chrome only (no outer Card) for nested workspace layouts. */
  embedded?: boolean;
  /** When embedded, hide the internal refresh row (e.g. Records uses a shared toolbar). */
  suppressEmbeddedToolbar?: boolean;
  /** Increment from parent to reload while embedded toolbar is suppressed. */
  toolbarRefreshNonce?: number;
  /** When set, Edit opens this handler instead of inline row editing. */
  onEditInSheet?: (row: DonationListRow) => void;
  /** When set, View opens this handler (e.g. read-only sheet). */
  onViewInSheet?: (row: DonationListRow) => void;
  /** Shown in the list card header to the left of Refresh (non-embedded only). */
  listHeaderActions?: ReactNode;
  /** Shown above the table when `embedded` and `suppressEmbeddedToolbar` are both true. */
  toolbarActions?: ReactNode;
};

export function AdminDonationsTable({
  refreshKey,
  embedded = false,
  suppressEmbeddedToolbar = false,
  toolbarRefreshNonce = 0,
  onEditInSheet,
  onViewInSheet,
  listHeaderActions,
  toolbarActions,
}: DonationsTableProps) {
  const { t, locale } = useAdminI18n();
  const dateLocale = adminDateLocaleTag(locale);
  const { bumpDataRefresh } = useAdminFinanceRefresh();
  const [rows, setRows] = useState<DonationListRow[]>([]);
  const [donorOptions, setDonorOptions] = useState<DonorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<DonationListRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    donor_id: "",
    amount: "",
    payment_method: "",
    reference_note: "",
    received_at_local: "",
    is_published: true,
  });

  const load = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);
    try {
      const [dRes, donorsRes] = await Promise.all([
        adminFetch<{ donations: DonationListRow[] }>("/api/admin/donations?limit=200"),
        adminFetch<{ donors: DonorOption[] }>("/api/admin/donors?limit=500"),
      ]);
      setRows(dRes.donations ?? []);
      setDonorOptions(donorsRes.donors ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("donationsTable.loadFailed"));
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

  function openEdit(row: DonationListRow) {
    setEditingId(row.id);
    setDraft({
      donor_id: row.donor_id ?? "",
      amount: String(row.amount_bdt),
      payment_method: row.payment_method,
      reference_note: row.reference_note ?? "",
      received_at_local: isoToDatetimeLocal(row.received_at),
      is_published: row.is_published,
    });
  }

  async function saveEdit(id: string) {
    setSaving(true);
    setError(null);
    try {
      const receivedIso =
        draft.received_at_local.trim() === ""
          ? undefined
          : new Date(draft.received_at_local).toISOString();

      const payload: Record<string, unknown> = {
        donor_id: draft.donor_id.trim() === "" ? null : draft.donor_id.trim(),
        amount_bdt: Number(draft.amount),
        payment_method: draft.payment_method.trim(),
        reference_note: draft.reference_note.trim() === "" ? null : draft.reference_note.trim(),
        is_published: draft.is_published,
      };
      if (receivedIso) {
        payload.received_at = receivedIso;
      }

      await adminFetch(`/api/admin/donations/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setEditingId(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("donationsTable.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeleteDonation() {
    if (!pendingDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await adminFetch(`/api/admin/donations/${pendingDelete.id}`, { method: "DELETE" });
      setPendingDelete(null);
      bumpDataRefresh();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("rowActions.deleteFailed"));
    } finally {
      setDeleting(false);
    }
  }

  async function downloadDonationReceiptPdf(row: DonationListRow) {
    setPdfLoadingId(row.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/donations/${row.id}/receipt-pdf`, {
        credentials: "same-origin",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(typeof j.error === "string" ? j.error : `Request failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `donation-receipt-${row.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("rowActions.pdfFailed"));
    } finally {
      setPdfLoadingId(null);
    }
  }

  const refreshButton = (
    <Button
      type="button"
      variant="outline"
      size="default"
      className="min-h-9 px-3 text-sm sm:min-h-10"
      onClick={() => void load()}
      disabled={loading}
    >
      {loading ? t("donationsTable.loading") : t("donationsTable.refresh")}
    </Button>
  );

  const body = (
    <>
      {embedded && !suppressEmbeddedToolbar ? (
        <div className="flex flex-wrap items-center justify-end gap-2">{refreshButton}</div>
      ) : null}
      {embedded && suppressEmbeddedToolbar && toolbarActions ? (
        <div className="flex flex-wrap items-center justify-end gap-2">{toolbarActions}</div>
      ) : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-[920px] w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 font-medium">{t("donationsTable.donor")}</th>
                <th className="px-3 py-2 font-medium">{t("donationsTable.amount")}</th>
                <th className="px-3 py-2 font-medium">{t("donationsTable.method")}</th>
                <th className="px-3 py-2 font-medium">{t("donationsTable.note")}</th>
                <th className="px-3 py-2 font-medium">{t("donationsTable.date")}</th>
                <th className="px-3 py-2 font-medium">{t("donationsTable.published")}</th>
                <th className="px-3 py-2 font-medium w-[72px] text-center">
                  {t("donationsTable.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-muted-foreground" colSpan={7}>
                    {t("donationsTable.loading")}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-muted-foreground" colSpan={7}>
                    {t("donationsTable.empty")}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <Fragment key={row.id}>
                    <tr className="border-t border-border">
                      <td className="px-3 py-2 align-top">{donorLabel(row)}</td>
                      <td className="px-3 py-2 align-top tabular-nums">
                        {formatAdminBdtAmount(row.amount_bdt, locale)}
                      </td>
                      <td className="px-3 py-2 align-top">{row.payment_method}</td>
                      <td className="px-3 py-2 align-top max-w-[200px] truncate" title={row.reference_note ?? ""}>
                        {row.reference_note?.trim() || "—"}
                      </td>
                      <td className="px-3 py-2 align-top whitespace-nowrap" lang={dateLocale}>
                        {new Date(row.received_at).toLocaleString(dateLocale, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-3 py-2 align-top">
                        {row.is_published ? t("donationsTable.yes") : t("donationsTable.no")}
                      </td>
                      <td className="px-3 py-2 align-top text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            type="button"
                            nativeButton
                            aria-label={t("rowActions.moreAria")}
                            disabled={saving || deleting || pdfLoadingId !== null}
                            className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                          >
                            <MoreVertical className="size-4" aria-hidden />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-40">
                            {onViewInSheet ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  onViewInSheet(row);
                                }}
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
                              onClick={() => void downloadDonationReceiptPdf(row)}
                              disabled={pdfLoadingId === row.id}
                            >
                              <span className="flex items-center gap-2">
                                <FileDown className="size-4 opacity-70" aria-hidden />
                                {t("rowActions.pdfReceipt")}
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                setPendingDelete(row);
                              }}
                            >
                              {t("rowActions.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                    {!onEditInSheet && editingId === row.id ? (
                      <tr key={`${row.id}-edit`} className="border-t border-border bg-muted/40">
                        <td className="px-3 py-4" colSpan={7}>
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2 md:col-span-2 lg:col-span-3">
                              <Label htmlFor={`donor-${row.id}`}>{t("donationsTable.donorSelect")}</Label>
                              <AdminDonorSelect
                                id={`donor-${row.id}`}
                                value={draft.donor_id}
                                onValueChange={(donor_id) => setDraft((p) => ({ ...p, donor_id }))}
                                donors={donorOptions}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`amt-${row.id}`}>{t("donationForm.amount")}</Label>
                              <Input
                                id={`amt-${row.id}`}
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={draft.amount}
                                onChange={(e) =>
                                  setDraft((p) => ({ ...p, amount: e.target.value }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`pm-${row.id}`}>{t("donationForm.method")}</Label>
                              <AdminPaymentMethodSelect
                                id={`pm-${row.id}`}
                                value={draft.payment_method}
                                onValueChange={(payment_method) =>
                                  setDraft((p) => ({ ...p, payment_method }))
                                }
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2 lg:col-span-3">
                              <AdminDatetimePicker
                                id={`dt-${row.id}`}
                                label={t("donationsTable.receivedAt")}
                                dateLocaleTag={dateLocale}
                                valueLocal={draft.received_at_local}
                                onChange={(received_at_local) =>
                                  setDraft((p) => ({ ...p, received_at_local }))
                                }
                                disabled={saving}
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor={`note-${row.id}`}>{t("donationsTable.referenceNote")}</Label>
                              <Textarea
                                id={`note-${row.id}`}
                                value={draft.reference_note}
                                onChange={(e) =>
                                  setDraft((p) => ({ ...p, reference_note: e.target.value }))
                                }
                                rows={2}
                              />
                            </div>
                            <div className="flex items-center gap-2 md:col-span-2">
                              <Checkbox
                                id={`pub-${row.id}`}
                                checked={draft.is_published}
                                onCheckedChange={(v) =>
                                  setDraft((p) => ({ ...p, is_published: Boolean(v) }))
                                }
                              />
                              <Label
                                htmlFor={`pub-${row.id}`}
                                className="cursor-pointer text-sm font-normal leading-snug"
                              >
                                {t("donationsTable.transparencyPublish")}
                              </Label>
                            </div>
                            <div className="flex flex-wrap gap-2 md:col-span-2 lg:col-span-3">
                              <Button
                                type="button"
                                onClick={() => void saveEdit(row.id)}
                                disabled={saving || !draft.amount.trim()}
                              >
                                {saving ? t("donationsTable.saving") : t("donationsTable.save")}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingId(null)}
                                disabled={saving}
                              >
                                {t("donationsTable.cancel")}
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
                <AlertDialogTitle>{t("rowActions.deleteDonationTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("rowActions.deleteDonationDescription")}
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
                  onClick={() => void confirmDeleteDonation()}
                >
                  {deleting ? t("rowActions.deleting") : t("rowActions.confirmDelete")}
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
    <Card>
      <CardHeader className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1 space-y-1.5 text-left">
          <CardTitle className="text-left">{t("donationsTable.sectionTitle")}</CardTitle>
          <CardDescription className="text-left">{t("lists.description")}</CardDescription>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-start gap-2 sm:justify-end">
          {listHeaderActions}
          {refreshButton}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-6">{body}</CardContent>
    </Card>
  );
}

export type ExpenseListRow = {
  id: string;
  category: string;
  amount_bdt: string;
  description: string;
  beneficiary_note: string | null;
  spent_at: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type ExpensesTableProps = {
  refreshKey: number;
  embedded?: boolean;
  suppressEmbeddedToolbar?: boolean;
  toolbarRefreshNonce?: number;
  onEditInSheet?: (row: ExpenseListRow) => void;
  onViewInSheet?: (row: ExpenseListRow) => void;
  listHeaderActions?: ReactNode;
  toolbarActions?: ReactNode;
};

export function AdminExpensesTable({
  refreshKey,
  embedded = false,
  suppressEmbeddedToolbar = false,
  toolbarRefreshNonce = 0,
  onEditInSheet,
  onViewInSheet,
  listHeaderActions,
  toolbarActions,
}: ExpensesTableProps) {
  const { t, locale } = useAdminI18n();
  const dateLocale = adminDateLocaleTag(locale);
  const { bumpDataRefresh } = useAdminFinanceRefresh();
  const [rows, setRows] = useState<ExpenseListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ExpenseListRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [draft, setDraft] = useState({
    category: "",
    amount: "",
    description: "",
    beneficiary_note: "",
    spent_at_local: "",
    is_published: true,
  });

  const load = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch<{ expenses: ExpenseListRow[] }>("/api/admin/expenses?limit=200");
      setRows(res.expenses ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("expensesTable.loadFailed"));
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

  function openEdit(row: ExpenseListRow) {
    setEditingId(row.id);
    setDraft({
      category: row.category,
      amount: String(row.amount_bdt),
      description: row.description,
      beneficiary_note: row.beneficiary_note ?? "",
      spent_at_local: isoToDatetimeLocal(row.spent_at),
      is_published: row.is_published,
    });
  }

  async function saveEdit(id: string) {
    setSaving(true);
    setError(null);
    try {
      const spentIso =
        draft.spent_at_local.trim() === ""
          ? undefined
          : new Date(draft.spent_at_local).toISOString();

      const payload: Record<string, unknown> = {
        category: draft.category.trim(),
        amount_bdt: Number(draft.amount),
        description: draft.description.trim(),
        beneficiary_note: draft.beneficiary_note.trim() === "" ? null : draft.beneficiary_note.trim(),
        is_published: draft.is_published,
      };
      if (spentIso) {
        payload.spent_at = spentIso;
      }

      await adminFetch(`/api/admin/expenses/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setEditingId(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("expensesTable.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeleteExpense() {
    if (!pendingDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await adminFetch(`/api/admin/expenses/${pendingDelete.id}`, { method: "DELETE" });
      setPendingDelete(null);
      bumpDataRefresh();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("rowActions.deleteFailed"));
    } finally {
      setDeleting(false);
    }
  }

  const refreshButton = (
    <Button
      type="button"
      variant="outline"
      size="default"
      className="min-h-9 px-3 text-sm sm:min-h-10"
      onClick={() => void load()}
      disabled={loading}
    >
      {loading ? t("expensesTable.loading") : t("expensesTable.refresh")}
    </Button>
  );

  const body = (
    <>
      {embedded && !suppressEmbeddedToolbar ? (
        <div className="flex flex-wrap items-center justify-end gap-2">{refreshButton}</div>
      ) : null}
      {embedded && suppressEmbeddedToolbar && toolbarActions ? (
        <div className="flex flex-wrap items-center justify-end gap-2">{toolbarActions}</div>
      ) : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-[960px] w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 font-medium">{t("expensesTable.category")}</th>
                <th className="px-3 py-2 font-medium">{t("expensesTable.amount")}</th>
                <th className="px-3 py-2 font-medium">{t("expensesTable.description")}</th>
                <th className="px-3 py-2 font-medium">{t("expensesTable.beneficiary")}</th>
                <th className="px-3 py-2 font-medium">{t("expensesTable.date")}</th>
                <th className="px-3 py-2 font-medium">{t("expensesTable.published")}</th>
                <th className="px-3 py-2 font-medium w-[72px] text-center">
                  {t("expensesTable.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-muted-foreground" colSpan={7}>
                    {t("expensesTable.loading")}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-muted-foreground" colSpan={7}>
                    {t("expensesTable.empty")}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <Fragment key={row.id}>
                    <tr className="border-t border-border">
                      <td className="px-3 py-2 align-top">{row.category}</td>
                      <td className="px-3 py-2 align-top tabular-nums">
                        {formatAdminBdtAmount(row.amount_bdt, locale)}
                      </td>
                      <td className="px-3 py-2 align-top max-w-[220px]">{row.description}</td>
                      <td className="px-3 py-2 align-top max-w-[160px] truncate" title={row.beneficiary_note ?? ""}>
                        {row.beneficiary_note?.trim() || "—"}
                      </td>
                      <td className="px-3 py-2 align-top whitespace-nowrap" lang={dateLocale}>
                        {new Date(row.spent_at).toLocaleString(dateLocale, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-3 py-2 align-top">
                        {row.is_published ? t("expensesTable.yes") : t("expensesTable.no")}
                      </td>
                      <td className="px-3 py-2 align-top text-center">
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
                              <DropdownMenuItem onClick={() => onViewInSheet(row)}>
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
                    {!onEditInSheet && editingId === row.id ? (
                      <tr key={`${row.id}-edit`} className="border-t border-border bg-muted/40">
                        <td className="px-3 py-4" colSpan={7}>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`ecat-${row.id}`}>{t("expenseForm.category")}</Label>
                              <AdminExpenseCategorySelect
                                id={`ecat-${row.id}`}
                                value={draft.category}
                                onValueChange={(category) => setDraft((p) => ({ ...p, category }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`eamt-${row.id}`}>{t("expenseForm.amount")}</Label>
                              <Input
                                id={`eamt-${row.id}`}
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={draft.amount}
                                onChange={(e) =>
                                  setDraft((p) => ({ ...p, amount: e.target.value }))
                                }
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor={`edesc-${row.id}`}>{t("expenseForm.descriptionLabel")}</Label>
                              <Textarea
                                id={`edesc-${row.id}`}
                                value={draft.description}
                                onChange={(e) =>
                                  setDraft((p) => ({ ...p, description: e.target.value }))
                                }
                                rows={3}
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor={`eben-${row.id}`}>{t("expenseForm.beneficiary")}</Label>
                              <Input
                                id={`eben-${row.id}`}
                                value={draft.beneficiary_note}
                                onChange={(e) =>
                                  setDraft((p) => ({ ...p, beneficiary_note: e.target.value }))
                                }
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <AdminDatetimePicker
                                id={`esp-${row.id}`}
                                label={t("expensesTable.spentAt")}
                                dateLocaleTag={dateLocale}
                                valueLocal={draft.spent_at_local}
                                onChange={(spent_at_local) =>
                                  setDraft((p) => ({ ...p, spent_at_local }))
                                }
                                disabled={saving}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`epub-${row.id}`}
                                checked={draft.is_published}
                                onCheckedChange={(v) =>
                                  setDraft((p) => ({ ...p, is_published: Boolean(v) }))
                                }
                              />
                              <Label
                                htmlFor={`epub-${row.id}`}
                                className="cursor-pointer text-sm font-normal leading-snug"
                              >
                                {t("expensesTable.transparencyPublish")}
                              </Label>
                            </div>
                            <div className="flex flex-wrap gap-2 md:col-span-2">
                              <Button
                                type="button"
                                onClick={() => void saveEdit(row.id)}
                                disabled={
                                  saving ||
                                  !draft.amount.trim() ||
                                  !draft.category.trim() ||
                                  !draft.description.trim()
                                }
                              >
                                {saving ? t("expensesTable.saving") : t("expensesTable.save")}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingId(null)}
                                disabled={saving}
                              >
                                {t("expensesTable.cancel")}
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
                <AlertDialogTitle>{t("rowActions.deleteExpenseTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("rowActions.deleteExpenseDescription")}
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
                  onClick={() => void confirmDeleteExpense()}
                >
                  {deleting ? t("rowActions.deleting") : t("rowActions.confirmDelete")}
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
    <Card>
      <CardHeader className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1 space-y-1.5 text-left">
          <CardTitle className="text-left">{t("expensesTable.sectionTitle")}</CardTitle>
          <CardDescription className="text-left">{t("lists.description")}</CardDescription>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-start gap-2 sm:justify-end">
          {listHeaderActions}
          {refreshButton}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-6">{body}</CardContent>
    </Card>
  );
}
