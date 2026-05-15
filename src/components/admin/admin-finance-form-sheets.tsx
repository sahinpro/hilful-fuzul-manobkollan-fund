"use client";

import type {
  DonationListRow,
  ExpenseListRow,
} from "@/components/admin/admin-finance-data-tables";
import { useAdminFinanceRefresh } from "@/components/admin/admin-finance-refresh-provider";
import {
  AdminDonorSelect,
  AdminExpenseCategorySelect,
  AdminPaymentMethodSelect,
  linkedDonorOptionFromRow,
} from "@/components/admin/admin-form-selects";
import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import { AdminDatetimePicker, isoToDatetimeLocal } from "@/components/admin/admin-datetime-picker";
import type { DonorRow } from "@/components/admin/admin-donors-table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { EXPENSE_CATEGORY_PRESETS } from "@/lib/admin/form-options";
import { adminDateLocaleTag } from "@/lib/i18n/admin-locale";
import { cn } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type DonorOption = {
  id: string;
  full_name: string;
  fathers_name?: string | null;
  phone: string | null;
  email: string | null;
};

function donorFullNameFromDonationRow(row: DonationListRow): string {
  const rel = row.donors;
  if (rel == null) return "";
  const one = Array.isArray(rel) ? rel[0] : rel;
  return one?.full_name?.trim() ?? "";
}

function donorFathersNameFromDonationRow(row: DonationListRow): string {
  const rel = row.donors;
  if (rel == null) return "";
  const one = Array.isArray(rel) ? rel[0] : rel;
  return one?.fathers_name?.trim() ?? "";
}

function donorNameForId(
  donorId: string,
  row: DonationListRow | null,
  options: DonorOption[],
): string {
  const id = donorId.trim();
  if (!id) return "";
  const fromList = options.find((d) => d.id === id);
  if (fromList) return fromList.full_name;
  if (row && (row.donor_id ?? "").trim() === id) {
    return donorFullNameFromDonationRow(row);
  }
  return "";
}

function donorFathersNameForId(
  donorId: string,
  row: DonationListRow | null,
  options: DonorOption[],
): string {
  const id = donorId.trim();
  if (!id) return "";
  const fromList = options.find((d) => d.id === id);
  if (fromList) {
    if ("fathers_name" in fromList) {
      return (fromList.fathers_name ?? "").trim();
    }
    if (row && (row.donor_id ?? "").trim() === id) {
      return donorFathersNameFromDonationRow(row);
    }
    return "";
  }
  if (row && (row.donor_id ?? "").trim() === id) {
    return donorFathersNameFromDonationRow(row);
  }
  return "";
}

type ApiState = {
  loading: boolean;
  ok: boolean | null;
  message: string;
};

const initState: ApiState = { loading: false, ok: null, message: "" };

async function postJson(path: string, payload: unknown) {
  const res = await fetch(path, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof json?.error === "string"
        ? json.error
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return json;
}

type DonationSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editRow: DonationListRow | null;
  viewOnly?: boolean;
};

export function AdminDonationFormSheet({
  open,
  onOpenChange,
  editRow,
  viewOnly = false,
}: DonationSheetProps) {
  const { t, locale } = useAdminI18n();
  const dateLocale = adminDateLocaleTag(locale);
  const { bumpDataRefresh } = useAdminFinanceRefresh();
  const [donorOptions, setDonorOptions] = useState<DonorOption[]>([]);
  const [formState, setFormState] = useState<ApiState>(initState);

  const [create, setCreate] = useState({
    donorName: "",
    fathersName: "",
    amount: "",
    method: "cash",
    note: "",
    published: true,
  });

  const [editDraft, setEditDraft] = useState({
    donor_id: "",
    donor_full_name: "",
    donor_fathers_name: "",
    amount: "",
    payment_method: "",
    reference_note: "",
    received_at_local: "",
    is_published: true,
  });

  const isEdit = Boolean(editRow);

  const resetCreate = useCallback(() => {
    setCreate({
      donorName: "",
      fathersName: "",
      amount: "",
      method: "cash",
      note: "",
      published: true,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const tid = window.setTimeout(() => {
      setFormState(initState);
      if (editRow) {
        setEditDraft({
          donor_id: editRow.donor_id ?? "",
          donor_full_name: donorFullNameFromDonationRow(editRow),
          donor_fathers_name: donorFathersNameFromDonationRow(editRow),
          amount: String(editRow.amount_bdt),
          payment_method: editRow.payment_method,
          reference_note: editRow.reference_note ?? "",
          received_at_local: isoToDatetimeLocal(editRow.received_at),
          is_published: editRow.is_published,
        });
        void (async () => {
          try {
            const res = await adminFetch<{ donors: DonorOption[] }>(
              "/api/admin/donors?limit=500",
            );
            const list = res.donors ?? [];
            setDonorOptions(list);
            setEditDraft((prev) => {
              if (prev.donor_id.trim() === "") return prev;
              let next = prev;
              if (prev.donor_full_name.trim() === "") {
                const filled = donorNameForId(prev.donor_id, editRow, list);
                if (filled) next = { ...next, donor_full_name: filled };
              }
              if (prev.donor_fathers_name.trim() === "") {
                const ff = donorFathersNameForId(prev.donor_id, editRow, list);
                if (ff) next = { ...next, donor_fathers_name: ff };
              }
              return next;
            });
          } catch {
            setDonorOptions([]);
          }
        })();
      } else {
        resetCreate();
      }
    }, 0);
    return () => window.clearTimeout(tid);
  }, [open, editRow, resetCreate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (viewOnly) return;
    setFormState({
      loading: true,
      ok: null,
      message: t("donationForm.submitting"),
    });

    try {
      if (editRow) {
        const donorId = editDraft.donor_id.trim();
        if (donorId && editDraft.donor_full_name.trim() === "") {
          throw new Error(t("donationForm.donorNameRequiredWhenLinked"));
        }
        const directoryName = donorNameForId(donorId, editRow, donorOptions).trim();
        const desiredName = editDraft.donor_full_name.trim();
        const directoryFathers = donorFathersNameForId(
          donorId,
          editRow,
          donorOptions,
        ).trim();
        const desiredFathers = editDraft.donor_fathers_name.trim();
        const donorPatch: Record<string, unknown> = {};
        if (donorId && desiredName !== "" && desiredName !== directoryName) {
          donorPatch.full_name = desiredName;
        }
        if (donorId && desiredFathers !== directoryFathers) {
          donorPatch.fathers_name = desiredFathers === "" ? null : desiredFathers;
        }
        if (donorId && Object.keys(donorPatch).length > 0) {
          await adminFetch(`/api/admin/donors/${donorId}`, {
            method: "PATCH",
            body: JSON.stringify(donorPatch),
          });
        }
        const receivedIso =
          editDraft.received_at_local.trim() === ""
            ? undefined
            : new Date(editDraft.received_at_local).toISOString();
        const payload: Record<string, unknown> = {
          donor_id: donorId === "" ? null : donorId,
          amount_bdt: Number(editDraft.amount),
          payment_method: editDraft.payment_method.trim(),
          reference_note:
            editDraft.reference_note.trim() === ""
              ? null
              : editDraft.reference_note.trim(),
          is_published: editDraft.is_published,
        };
        if (receivedIso) payload.received_at = receivedIso;

        await adminFetch(`/api/admin/donations/${editRow.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setFormState({
          loading: false,
          ok: true,
          message: t("donationForm.updateSuccess", { id: editRow.id }),
        });
      } else {
        const payload: Record<string, unknown> = {
          amount_bdt: Number(create.amount),
          payment_method: create.method,
          reference_note: create.note || null,
          is_published: create.published,
        };
        if (create.donorName.trim()) {
          payload.donor = {
            full_name: create.donorName.trim(),
            fathers_name: create.fathersName.trim() || null,
          };
        }
        const res = await postJson("/api/admin/donations", payload);
        const id = res?.donation?.id ?? "created";
        setFormState({
          loading: false,
          ok: true,
          message: t("donationForm.success", { id: String(id) }),
        });
        setCreate((prev) => ({ ...prev, amount: "", note: "", fathersName: "" }));
      }
      bumpDataRefresh();
    } catch (err) {
      setFormState({
        loading: false,
        ok: false,
        message:
          err instanceof Error ? err.message : t("donationForm.genericError"),
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex h-dvh max-h-dvh w-full max-w-none flex-col gap-0 border-l border-border p-0 duration-300 ease-out sm:max-w-md"
      >
        <SheetHeader className="border-b border-border px-6 py-4 text-left">
          <SheetTitle>
            {viewOnly && isEdit
              ? t("donationForm.viewTitle")
              : isEdit
                ? t("donationForm.editTitle")
                : t("donationForm.title")}
          </SheetTitle>
          <SheetDescription>
            {viewOnly && isEdit
              ? t("donationForm.viewDescription")
              : isEdit
                ? t("donationForm.editDescription")
                : t("donationForm.description")}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
          <form
            className="mx-auto w-full max-w-md space-y-4"
            onSubmit={(e) => void handleSubmit(e)}
          >
            {isEdit ? (
              <fieldset disabled={viewOnly} className="m-0 min-w-0 space-y-4 border-0 p-0">
                <div className="space-y-2">
                  <Label htmlFor="sheet-donor">
                    {t("donationsTable.donorSelect")}
                  </Label>
                  <AdminDonorSelect
                    id="sheet-donor"
                    value={editDraft.donor_id}
                    onValueChange={(donor_id) =>
                      setEditDraft((p) => ({
                        ...p,
                        donor_id,
                        donor_full_name: donorNameForId(
                          donor_id,
                          editRow,
                          donorOptions,
                        ),
                        donor_fathers_name: donorFathersNameForId(
                          donor_id,
                          editRow,
                          donorOptions,
                        ),
                      }))
                    }
                    donors={donorOptions}
                    linkedDonor={
                      editRow
                        ? linkedDonorOptionFromRow(
                            editRow,
                            t("donationsTable.donorNameMissing"),
                          )
                        : null
                    }
                  />
                </div>
                {editDraft.donor_id.trim() !== "" ? (
                  <div className="space-y-2">
                    <Label htmlFor="sheet-donor-name">
                      {t("donationForm.donorName")}
                    </Label>
                    <Input
                      id="sheet-donor-name"
                      value={editDraft.donor_full_name}
                      onChange={(e) =>
                        setEditDraft((p) => ({
                          ...p,
                          donor_full_name: e.target.value,
                        }))
                      }
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("donationForm.donorNameEditHint")}
                    </p>
                  </div>
                ) : null}
                {editDraft.donor_id.trim() !== "" ? (
                  <div className="space-y-2">
                    <Label htmlFor="sheet-donor-father">
                      {t("donationForm.donorFathersName")}{" "}
                      <span className="font-normal text-muted-foreground">
                        ({t("donorForm.fathersNameOptional")})
                      </span>
                    </Label>
                    <Input
                      id="sheet-donor-father"
                      value={editDraft.donor_fathers_name}
                      onChange={(e) =>
                        setEditDraft((p) => ({
                          ...p,
                          donor_fathers_name: e.target.value,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("donationForm.donorFathersNameEditHint")}
                    </p>
                  </div>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="sheet-damt">{t("donationForm.amount")}</Label>
                  <Input
                    id="sheet-damt"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={editDraft.amount}
                    onChange={(e) =>
                      setEditDraft((p) => ({ ...p, amount: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sheet-dpm">{t("donationForm.method")}</Label>
                  <AdminPaymentMethodSelect
                    id="sheet-dpm"
                    value={editDraft.payment_method}
                    onValueChange={(payment_method) =>
                      setEditDraft((p) => ({ ...p, payment_method }))
                    }
                  />
                </div>
                <AdminDatetimePicker
                  id="sheet-dt"
                  label={t("donationsTable.receivedAt")}
                  dateLocaleTag={dateLocale}
                  valueLocal={editDraft.received_at_local}
                  onChange={(received_at_local) =>
                    setEditDraft((p) => ({ ...p, received_at_local }))
                  }
                />
                <div className="space-y-2">
                  <Label htmlFor="sheet-dnote">
                    {t("donationsTable.referenceNote")}
                  </Label>
                  <Textarea
                    id="sheet-dnote"
                    value={editDraft.reference_note}
                    onChange={(e) =>
                      setEditDraft((p) => ({
                        ...p,
                        reference_note: e.target.value,
                      }))
                    }
                    rows={2}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="sheet-dpub"
                    checked={editDraft.is_published}
                    onCheckedChange={(v) =>
                      setEditDraft((p) => ({ ...p, is_published: Boolean(v) }))
                    }
                  />
                  <Label
                    htmlFor="sheet-dpub"
                    className="cursor-pointer text-sm font-normal"
                  >
                    {t("donationsTable.transparencyPublish")}
                  </Label>
                </div>
              </fieldset>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="sheet-cname">
                    {t("donationForm.donorName")}{" "}
                    <span className="font-normal text-muted-foreground">
                      {t("donationForm.donorOptional")}
                    </span>
                  </Label>
                  <Input
                    id="sheet-cname"
                    value={create.donorName}
                    onChange={(e) =>
                      setCreate((p) => ({ ...p, donorName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sheet-cfather">
                    {t("donationForm.donorFathersName")}{" "}
                    <span className="font-normal text-muted-foreground">
                      {t("donorForm.fathersNameOptional")}
                    </span>
                  </Label>
                  <Input
                    id="sheet-cfather"
                    value={create.fathersName}
                    onChange={(e) =>
                      setCreate((p) => ({ ...p, fathersName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="sheet-camt">
                      {t("donationForm.amount")}
                    </Label>
                    <Popover>
                      <PopoverTrigger
                        type="button"
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon-sm" }),
                          "size-7 text-muted-foreground hover:text-foreground",
                        )}
                        aria-label={t("donationForm.amountHelpAria")}
                      >
                        <InfoIcon className="size-4" />
                      </PopoverTrigger>
                      <PopoverContent className="w-80 text-sm" align="start">
                        <p>{t("donationForm.amountHelp")}</p>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Input
                    id="sheet-camt"
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={create.amount}
                    onChange={(e) =>
                      setCreate((p) => ({ ...p, amount: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sheet-cm">{t("donationForm.method")}</Label>
                  <AdminPaymentMethodSelect
                    id="sheet-cm"
                    value={create.method}
                    onValueChange={(method) =>
                      setCreate((p) => ({ ...p, method }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sheet-cn">{t("donationForm.note")}</Label>
                  <Textarea
                    id="sheet-cn"
                    value={create.note}
                    onChange={(e) =>
                      setCreate((p) => ({ ...p, note: e.target.value }))
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="sheet-cpub"
                    checked={create.published}
                    onCheckedChange={(v) =>
                      setCreate((p) => ({ ...p, published: Boolean(v) }))
                    }
                  />
                  <Label
                    htmlFor="sheet-cpub"
                    className="cursor-pointer text-sm font-normal"
                  >
                    {t("donationForm.publish")}
                  </Label>
                </div>
              </>
            )}
            <Button
              type="submit"
              disabled={formState.loading || (viewOnly && isEdit)}
              className="w-full sm:w-auto"
            >
              {formState.loading
                ? t("donationForm.submitting")
                : isEdit
                  ? t("donationForm.updateSubmit")
                  : t("donationForm.submit")}
            </Button>
            {formState.message ? (
              <p
                className={`text-sm ${
                  formState.ok ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {formState.message}
              </p>
            ) : null}
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

type ExpenseSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editRow: ExpenseListRow | null;
  viewOnly?: boolean;
};

export function AdminExpenseFormSheet({
  open,
  onOpenChange,
  editRow,
  viewOnly = false,
}: ExpenseSheetProps) {
  const { t, locale } = useAdminI18n();
  const dateLocale = adminDateLocaleTag(locale);
  const { bumpDataRefresh } = useAdminFinanceRefresh();
  const [formState, setFormState] = useState<ApiState>(initState);

  const [create, setCreate] = useState({
    category: (EXPENSE_CATEGORY_PRESETS[0] ?? "") as string,
    amount: "",
    description: "",
    beneficiary: "",
    published: true,
  });

  const [editDraft, setEditDraft] = useState({
    category: "",
    amount: "",
    description: "",
    beneficiary_note: "",
    spent_at_local: "",
    is_published: true,
  });

  const isEdit = Boolean(editRow);

  const resetCreate = useCallback(() => {
    setCreate({
      category: (EXPENSE_CATEGORY_PRESETS[0] ?? "") as string,
      amount: "",
      description: "",
      beneficiary: "",
      published: true,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const tid = window.setTimeout(() => {
      setFormState(initState);
      if (editRow) {
        setEditDraft({
          category: editRow.category,
          amount: String(editRow.amount_bdt),
          description: editRow.description,
          beneficiary_note: editRow.beneficiary_note ?? "",
          spent_at_local: isoToDatetimeLocal(editRow.spent_at),
          is_published: editRow.is_published,
        });
      } else {
        resetCreate();
      }
    }, 0);
    return () => window.clearTimeout(tid);
  }, [open, editRow, resetCreate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (viewOnly) return;
    setFormState({
      loading: true,
      ok: null,
      message: t("expenseForm.submitting"),
    });

    try {
      if (editRow) {
        const spentIso =
          editDraft.spent_at_local.trim() === ""
            ? undefined
            : new Date(editDraft.spent_at_local).toISOString();
        const payload: Record<string, unknown> = {
          category: editDraft.category.trim(),
          amount_bdt: Number(editDraft.amount),
          description: editDraft.description.trim(),
          beneficiary_note:
            editDraft.beneficiary_note.trim() === ""
              ? null
              : editDraft.beneficiary_note.trim(),
          is_published: editDraft.is_published,
        };
        if (spentIso) payload.spent_at = spentIso;

        await adminFetch(`/api/admin/expenses/${editRow.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setFormState({
          loading: false,
          ok: true,
          message: t("expenseForm.updateSuccess", { id: editRow.id }),
        });
      } else {
        const res = await postJson("/api/admin/expenses", {
          category: create.category,
          amount_bdt: Number(create.amount),
          description: create.description,
          beneficiary_note: create.beneficiary || null,
          is_published: create.published,
        });
        const id = res?.expense?.id ?? "created";
        setFormState({
          loading: false,
          ok: true,
          message: t("expenseForm.success", { id: String(id) }),
        });
        setCreate((prev) => ({
          ...prev,
          amount: "",
          description: "",
          beneficiary: "",
        }));
      }
      bumpDataRefresh();
    } catch (err) {
      setFormState({
        loading: false,
        ok: false,
        message:
          err instanceof Error ? err.message : t("expenseForm.genericError"),
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex h-dvh max-h-dvh w-full max-w-none flex-col gap-0 border-l border-border p-0 duration-300 ease-out sm:max-w-md"
      >
        <SheetHeader className="border-b border-border px-6 py-4 text-left">
          <SheetTitle>
            {viewOnly && isEdit
              ? t("expenseForm.viewTitle")
              : isEdit
                ? t("expenseForm.editTitle")
                : t("expenseForm.title")}
          </SheetTitle>
          <SheetDescription>
            {viewOnly && isEdit
              ? t("expenseForm.viewDescription")
              : isEdit
                ? t("expenseForm.editDescription")
                : t("expenseForm.description")}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
          <form
            className="mx-auto w-full max-w-md space-y-4"
            onSubmit={(e) => void handleSubmit(e)}
          >
            <fieldset
              disabled={viewOnly && isEdit}
              className="m-0 min-w-0 space-y-4 border-0 p-0"
            >
            <div className="space-y-2">
              <Label htmlFor="sheet-ecat">{t("expenseForm.category")}</Label>
              <AdminExpenseCategorySelect
                id="sheet-ecat"
                value={isEdit ? editDraft.category : create.category}
                onValueChange={(category) =>
                  isEdit
                    ? setEditDraft((p) => ({ ...p, category }))
                    : setCreate((p) => ({ ...p, category }))
                }
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="sheet-eamt">{t("expenseForm.amount")}</Label>
                <Popover>
                  <PopoverTrigger
                    type="button"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon-sm" }),
                      "size-7 text-muted-foreground hover:text-foreground",
                    )}
                    aria-label={t("expenseForm.amountHelpAria")}
                  >
                    <InfoIcon className="size-4" />
                  </PopoverTrigger>
                  <PopoverContent className="w-80 text-sm" align="start">
                    <p>{t("expenseForm.amountHelp")}</p>
                  </PopoverContent>
                </Popover>
              </div>
              <Input
                id="sheet-eamt"
                type="number"
                min="1"
                step="0.01"
                required
                value={isEdit ? editDraft.amount : create.amount}
                onChange={(e) =>
                  isEdit
                    ? setEditDraft((p) => ({ ...p, amount: e.target.value }))
                    : setCreate((p) => ({ ...p, amount: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sheet-edesc">
                {t("expenseForm.descriptionLabel")}
              </Label>
              <Textarea
                id="sheet-edesc"
                required
                value={isEdit ? editDraft.description : create.description}
                onChange={(e) =>
                  isEdit
                    ? setEditDraft((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    : setCreate((p) => ({ ...p, description: e.target.value }))
                }
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sheet-eben">{t("expenseForm.beneficiary")}</Label>
              <Input
                id="sheet-eben"
                value={isEdit ? editDraft.beneficiary_note : create.beneficiary}
                onChange={(e) =>
                  isEdit
                    ? setEditDraft((p) => ({
                        ...p,
                        beneficiary_note: e.target.value,
                      }))
                    : setCreate((p) => ({ ...p, beneficiary: e.target.value }))
                }
              />
            </div>
            {isEdit ? (
              <AdminDatetimePicker
                id="sheet-esp"
                label={t("expensesTable.spentAt")}
                dateLocaleTag={dateLocale}
                valueLocal={editDraft.spent_at_local}
                onChange={(spent_at_local) =>
                  setEditDraft((p) => ({ ...p, spent_at_local }))
                }
              />
            ) : null}
            <div className="flex items-center gap-2">
              <Checkbox
                id="sheet-epub"
                checked={isEdit ? editDraft.is_published : create.published}
                onCheckedChange={(v) =>
                  isEdit
                    ? setEditDraft((p) => ({ ...p, is_published: Boolean(v) }))
                    : setCreate((p) => ({ ...p, published: Boolean(v) }))
                }
              />
              <Label
                htmlFor="sheet-epub"
                className="cursor-pointer text-sm font-normal"
              >
                {isEdit
                  ? t("expensesTable.transparencyPublish")
                  : t("expenseForm.publish")}
              </Label>
            </div>
            </fieldset>
            <Button
              type="submit"
              disabled={formState.loading || (viewOnly && isEdit)}
              className="w-full sm:w-auto"
            >
              {formState.loading
                ? t("expenseForm.submitting")
                : isEdit
                  ? t("expenseForm.updateSubmit")
                  : t("expenseForm.submit")}
            </Button>
            {formState.message ? (
              <p
                className={`text-sm ${
                  formState.ok ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {formState.message}
              </p>
            ) : null}
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

type DonorSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editRow: DonorRow | null;
  viewOnly?: boolean;
};

export function AdminDonorFormSheet({
  open,
  onOpenChange,
  editRow,
  viewOnly = false,
}: DonorSheetProps) {
  const { t } = useAdminI18n();
  const { bumpDataRefresh } = useAdminFinanceRefresh();
  const [formState, setFormState] = useState<ApiState>(initState);
  const [create, setCreate] = useState({ full_name: "", fathers_name: "", phone: "", email: "" });
  const [editDraft, setEditDraft] = useState({
    full_name: "",
    fathers_name: "",
    phone: "",
    email: "",
  });
  const isEdit = Boolean(editRow);

  useEffect(() => {
    if (!open) return;
    const row = editRow;
    const tid = window.setTimeout(() => {
      setFormState(initState);
      if (row) {
        setEditDraft({
          full_name: row.full_name,
          fathers_name: row.fathers_name ?? "",
          phone: row.phone ?? "",
          email: row.email ?? "",
        });
      } else {
        setCreate({ full_name: "", fathers_name: "", phone: "", email: "" });
      }
    }, 0);
    return () => window.clearTimeout(tid);
  }, [open, editRow]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (viewOnly) return;
    setFormState({
      loading: true,
      ok: null,
      message: t("donorForm.submitting"),
    });

    try {
      if (editRow) {
        await adminFetch(`/api/admin/donors/${editRow.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            full_name: editDraft.full_name.trim(),
            fathers_name:
              editDraft.fathers_name.trim() === ""
                ? null
                : editDraft.fathers_name.trim(),
            phone: editDraft.phone.trim() === "" ? null : editDraft.phone.trim(),
            email: editDraft.email.trim(),
          }),
        });
        setFormState({
          loading: false,
          ok: true,
          message: t("donorForm.updateSuccess", { id: editRow.id }),
        });
      } else {
        const payload: Record<string, unknown> = {
          full_name: create.full_name.trim(),
          fathers_name: create.fathers_name.trim() === "" ? null : create.fathers_name.trim(),
          phone: create.phone.trim() === "" ? null : create.phone.trim(),
        };
        const em = create.email.trim();
        if (em) payload.email = em;
        const res = await postJson("/api/admin/donors", payload);
        const id = res?.donor?.id ?? "created";
        setFormState({
          loading: false,
          ok: true,
          message: t("donorForm.success", { id: String(id) }),
        });
        setCreate({ full_name: "", fathers_name: "", phone: "", email: "" });
      }
      bumpDataRefresh();
    } catch (err) {
      setFormState({
        loading: false,
        ok: false,
        message:
          err instanceof Error ? err.message : t("donorForm.genericError"),
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex h-dvh max-h-dvh w-full max-w-none flex-col gap-0 border-l border-border p-0 duration-300 ease-out sm:max-w-md"
      >
        <SheetHeader className="border-b border-border px-6 py-4 text-left">
          <SheetTitle>
            {viewOnly && isEdit
              ? t("donorForm.viewTitle")
              : isEdit
                ? t("donorForm.editTitle")
                : t("donorForm.title")}
          </SheetTitle>
          <SheetDescription>
            {viewOnly && isEdit
              ? t("donorForm.viewDescription")
              : isEdit
                ? t("donorForm.editDescription")
                : t("donorForm.description")}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
          <form
            className="mx-auto w-full max-w-md space-y-4"
            onSubmit={(e) => void handleSubmit(e)}
          >
            <fieldset
              disabled={viewOnly && isEdit}
              className="m-0 min-w-0 space-y-4 border-0 p-0"
            >
              <div className="space-y-2">
                <Label htmlFor="sheet-donor-fn">{t("donorsTable.name")}</Label>
                <Input
                  id="sheet-donor-fn"
                  required
                  value={isEdit ? editDraft.full_name : create.full_name}
                  onChange={(e) =>
                    isEdit
                      ? setEditDraft((p) => ({ ...p, full_name: e.target.value }))
                      : setCreate((p) => ({ ...p, full_name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sheet-donor-father-fn">
                  {t("donorForm.fathersName")}{" "}
                  <span className="font-normal text-muted-foreground">
                    {t("donorForm.fathersNameOptional")}
                  </span>
                </Label>
                <Input
                  id="sheet-donor-father-fn"
                  value={isEdit ? editDraft.fathers_name : create.fathers_name}
                  onChange={(e) =>
                    isEdit
                      ? setEditDraft((p) => ({
                          ...p,
                          fathers_name: e.target.value,
                        }))
                      : setCreate((p) => ({
                          ...p,
                          fathers_name: e.target.value,
                        }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sheet-donor-ph">{t("donorsTable.phone")}</Label>
                <Input
                  id="sheet-donor-ph"
                  value={isEdit ? editDraft.phone : create.phone}
                  onChange={(e) =>
                    isEdit
                      ? setEditDraft((p) => ({ ...p, phone: e.target.value }))
                      : setCreate((p) => ({ ...p, phone: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sheet-donor-em">{t("donorsTable.email")}</Label>
                <Input
                  id="sheet-donor-em"
                  type="email"
                  value={isEdit ? editDraft.email : create.email}
                  onChange={(e) =>
                    isEdit
                      ? setEditDraft((p) => ({ ...p, email: e.target.value }))
                      : setCreate((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>
            </fieldset>
            <Button
              type="submit"
              disabled={formState.loading || (viewOnly && isEdit)}
              className="w-full sm:w-auto"
            >
              {formState.loading
                ? t("donorForm.submitting")
                : isEdit
                  ? t("donorForm.updateSubmit")
                  : t("donorForm.submit")}
            </Button>
            {formState.message ? (
              <p
                className={`text-sm ${
                  formState.ok ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {formState.message}
              </p>
            ) : null}
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
