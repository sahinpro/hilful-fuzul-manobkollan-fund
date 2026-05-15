"use client";

import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileDown, Receipt, Wallet } from "lucide-react";
import { useState } from "react";

type ExportKind = "donations" | "expenses";

export function AdminFinanceExportToolbar() {
  const { t } = useAdminI18n();
  const [opening, setOpening] = useState<ExportKind | null>(null);

  function openExport(kind: ExportKind) {
    setOpening(kind);
    const url = `/api/admin/exports/finance-sheet?kind=${kind}`;
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => setOpening(null), 600);
  }

  return (
    <Card>
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-left">{t("export.title")}</CardTitle>
        <CardDescription className="text-left">{t("export.description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant="default"
          className="min-h-10 gap-2"
          disabled={opening !== null}
          onClick={() => openExport("donations")}
        >
          <Receipt className="size-4 shrink-0" aria-hidden />
          {opening === "donations" ? t("export.opening") : t("export.donations")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-10 gap-2"
          disabled={opening !== null}
          onClick={() => openExport("expenses")}
        >
          <Wallet className="size-4 shrink-0" aria-hidden />
          {opening === "expenses" ? t("export.opening") : t("export.expenses")}
        </Button>
        <p className="flex w-full items-center gap-2 text-xs text-muted-foreground sm:basis-full">
          <FileDown className="size-3.5 shrink-0" aria-hidden />
          {t("export.hint")}
        </p>
      </CardContent>
    </Card>
  );
}
