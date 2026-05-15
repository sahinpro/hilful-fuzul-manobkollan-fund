"use client";

import { useAdminFinanceRefresh } from "@/components/admin/admin-finance-refresh-provider";
import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { useEffect, useState } from "react";

export type LeadershipCategory = "advisor" | "executive";

export type LeadershipMemberRow = {
  id: string;
  category: string;
  full_name: string;
  fathers_name: string | null;
  designation: string | null;
  sort_order: number;
  created_at: string;
};

type ApiState = { loading: boolean; ok: boolean | null; message: string };

const initState: ApiState = { loading: false, ok: null, message: "" };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: LeadershipCategory;
  editRow: LeadershipMemberRow | null;
};

export function AdminLeadershipFormSheet({ open, onOpenChange, category, editRow }: Props) {
  const { t } = useAdminI18n();
  const { bumpDataRefresh } = useAdminFinanceRefresh();
  const [formState, setFormState] = useState<ApiState>(initState);
  const [fullName, setFullName] = useState("");
  const [fathersName, setFathersName] = useState("");
  const [designation, setDesignation] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  const isEdit = Boolean(editRow);

  useEffect(() => {
    if (!open) return;
    const row = editRow;
    const tid = window.setTimeout(() => {
      setFormState(initState);
      if (row) {
        setFullName(row.full_name);
        setFathersName(row.fathers_name?.trim() ?? "");
        setDesignation(row.designation?.trim() ?? "");
        setSortOrder(String(row.sort_order ?? 0));
      } else {
        setFullName("");
        setFathersName("");
        setDesignation("");
        setSortOrder("0");
      }
    }, 0);
    return () => window.clearTimeout(tid);
  }, [open, editRow]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState({ loading: true, ok: null, message: t("leadershipForm.submitting") });

    try {
      const so = Number.parseInt(sortOrder, 10);
      const sort_order = Number.isFinite(so) ? Math.max(0, so) : 0;

      if (editRow) {
        await adminFetch(`/api/admin/leadership-members/${editRow.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            full_name: fullName.trim(),
            fathers_name: fathersName.trim() === "" ? null : fathersName.trim(),
            designation: designation.trim() === "" ? null : designation.trim(),
            sort_order,
          }),
        });
        setFormState({
          loading: false,
          ok: true,
          message: t("leadershipForm.updateSuccess", { id: editRow.id }),
        });
      } else {
        await adminFetch("/api/admin/leadership-members", {
          method: "POST",
          body: JSON.stringify({
            category,
            full_name: fullName.trim(),
            fathers_name: fathersName.trim() === "" ? null : fathersName.trim(),
            designation: designation.trim() === "" ? null : designation.trim(),
            sort_order,
          }),
        });
        setFormState({
          loading: false,
          ok: true,
          message: t("leadershipForm.createSuccess"),
        });
      }
      bumpDataRefresh();
    } catch (err) {
      setFormState({
        loading: false,
        ok: false,
        message: err instanceof Error ? err.message : t("leadershipForm.genericError"),
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
            {isEdit ? t("leadershipForm.editTitle") : t("leadershipForm.createTitle")}
          </SheetTitle>
          <SheetDescription>{t("leadershipForm.description")}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
          <form className="mx-auto w-full max-w-md space-y-4" onSubmit={(e) => void handleSubmit(e)}>
            <div className="space-y-2">
              <Label htmlFor="lm-name">{t("leadershipTable.name")}</Label>
              <Input
                id="lm-name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lm-father">
                {t("leadershipTable.fathersName")}{" "}
                <span className="font-normal text-muted-foreground">
                  {t("leadershipForm.fathersNameOptional")}
                </span>
              </Label>
              <Input
                id="lm-father"
                value={fathersName}
                onChange={(e) => setFathersName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lm-desig">
                {t("leadershipTable.designation")}{" "}
                <span className="font-normal text-muted-foreground">
                  {t("leadershipForm.designationOptional")}
                </span>
              </Label>
              <Input
                id="lm-desig"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lm-sort">{t("leadershipTable.sortOrder")}</Label>
              <Input
                id="lm-sort"
                inputMode="numeric"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{t("leadershipForm.sortOrderHint")}</p>
            </div>

            {formState.message ? (
              <p
                className={
                  formState.ok === true
                    ? "text-sm text-emerald-600 dark:text-emerald-400"
                    : formState.ok === false
                      ? "text-sm text-destructive"
                      : "text-sm text-muted-foreground"
                }
              >
                {formState.message}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="submit" disabled={formState.loading || !fullName.trim()}>
                {formState.loading
                  ? t("leadershipForm.submitting")
                  : isEdit
                    ? t("leadershipForm.saveUpdate")
                    : t("leadershipForm.saveCreate")}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("leadershipForm.close")}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
