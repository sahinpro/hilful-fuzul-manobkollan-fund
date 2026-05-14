"use client";

import { useMemo } from "react";
import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  EXPENSE_CATEGORY_PRESETS,
  isPresetExpenseCategory,
  isPresetPaymentMethod,
  PAYMENT_METHOD_PRESETS,
} from "@/lib/admin/form-options";

export type DonorOption = {
  id: string;
  full_name: string;
  phone: string | null;
};

const NO_DONOR_VALUE = "__none__";

/** Ensures the row’s linked donor appears in the list so the select shows a name, not a bare UUID. */
export function linkedDonorOptionFromRow(
  row: {
    donor_id: string | null;
    donors:
      | { full_name: string | null; phone: string | null }
      | Array<{ full_name: string | null; phone: string | null }>
      | null;
  },
  nameIfMissing: string,
): DonorOption | null {
  const id = row.donor_id?.trim();
  if (!id) return null;
  const rel = row.donors;
  const one = rel == null ? null : Array.isArray(rel) ? rel[0] : rel;
  const name = one?.full_name?.trim();
  return {
    id,
    full_name: name && name.length > 0 ? name : nameIfMissing,
    phone: one?.phone ?? null,
  };
}

export function AdminDonorSelect({
  id,
  value,
  onValueChange,
  donors,
  linkedDonor,
  className,
}: {
  id: string;
  value: string;
  onValueChange: (v: string) => void;
  donors: DonorOption[];
  /** Merged first if missing from `donors` (fixes trigger showing raw UUID before/without directory fetch). */
  linkedDonor?: DonorOption | null;
  className?: string;
}) {
  const { t } = useAdminI18n();
  const inner = value.trim() === "" ? NO_DONOR_VALUE : value;

  const mergedDonors = useMemo(() => {
    let list: DonorOption[];
    if (!linkedDonor?.id) {
      list = donors;
    } else if (donors.some((d) => d.id === linkedDonor.id)) {
      list = donors;
    } else {
      list = [linkedDonor, ...donors];
    }
    const vid = value.trim();
    if (vid !== "" && vid !== NO_DONOR_VALUE && !list.some((d) => d.id === vid)) {
      const fallback: DonorOption =
        linkedDonor?.id === vid
          ? linkedDonor
          : {
              id: vid,
              full_name: t("donationsTable.donorNameMissing"),
              phone: null,
            };
      list = [fallback, ...list];
    }
    return list;
  }, [donors, linkedDonor, value, t]);

  return (
    <Select
      value={inner}
      onValueChange={(v) => {
        if (v === null) return;
        onValueChange(v === NO_DONOR_VALUE ? "" : v);
      }}
    >
      <SelectTrigger id={id} className={cn("w-full max-w-md", className)}>
        <SelectValue placeholder={t("donationsTable.noDonorLink")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NO_DONOR_VALUE}>{t("donationsTable.noDonorLink")}</SelectItem>
        {mergedDonors.map((d) => (
          <SelectItem key={d.id} value={d.id}>
            {d.full_name}
            {d.phone ? ` — ${d.phone}` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AdminPaymentMethodSelect({
  id,
  value,
  onValueChange,
  className,
}: {
  id?: string;
  value: string;
  onValueChange: (v: string) => void;
  className?: string;
}) {
  const { t } = useAdminI18n();
  const extras =
    value.trim() !== "" && !isPresetPaymentMethod(value) ? [value] : ([] as string[]);

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (v !== null) onValueChange(v);
      }}
    >
      <SelectTrigger id={id} className={cn("w-full", className)}>
        <SelectValue placeholder={t("donationForm.method")} />
      </SelectTrigger>
      <SelectContent>
        {PAYMENT_METHOD_PRESETS.map((key) => (
          <SelectItem key={key} value={key}>
            {t(`donationForm.methodOption.${key}`)}
          </SelectItem>
        ))}
        {extras.map((key) => (
          <SelectItem key={`extra-${key}`} value={key}>
            {key}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AdminExpenseCategorySelect({
  id,
  value,
  onValueChange,
  className,
}: {
  id?: string;
  value: string;
  onValueChange: (v: string) => void;
  className?: string;
}) {
  const { t } = useAdminI18n();
  const extras =
    value.trim() !== "" && !isPresetExpenseCategory(value) ? [value] : ([] as string[]);

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (v !== null) onValueChange(v);
      }}
    >
      <SelectTrigger id={id} className={cn("w-full", className)}>
        <SelectValue placeholder={t("expenseForm.category")} />
      </SelectTrigger>
      <SelectContent>
        {EXPENSE_CATEGORY_PRESETS.map((cat) => (
          <SelectItem key={cat} value={cat}>
            {cat}
          </SelectItem>
        ))}
        {extras.map((cat) => (
          <SelectItem key={`extra-${cat}`} value={cat}>
            {cat}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
