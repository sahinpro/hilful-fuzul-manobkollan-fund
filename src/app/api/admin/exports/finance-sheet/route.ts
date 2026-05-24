import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveExportCornerArtUrls } from "@/config/export-sheet-art";
import { getSiteLocaleText, siteConfig } from "@/config/site";
import { requireAdminApi } from "@/lib/admin/auth";
import {
  donationRowsForExport,
  expenseRowsForExport,
  sumBdtAmounts,
  type DonationExportRow,
  type ExpenseExportRow,
} from "@/lib/admin/finance-export-data";
import {
  buildFinanceExportHtmlDocument,
  type FinanceSheetKind,
} from "@/lib/admin/finance-export-html";
import { adminDateLocaleTag } from "@/lib/i18n/admin-locale";
import { createAdminTranslator } from "@/lib/i18n/admin-translate";
import { formatPublicBdt } from "@/lib/i18n/format-digits";
import { createServiceSupabase } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const kindSchema = z.enum(["donations", "expenses"]);
const SHEET_LOCALE = "bn" as const;

const DONATION_COLUMNS =
  "id, amount_bdt, payment_method, reference_note, received_at, is_published, donors (full_name, fathers_name)";

export async function GET(request: Request) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const kindParsed = kindSchema.safeParse(url.searchParams.get("kind"));
  if (!kindParsed.success) {
    return NextResponse.json(
      { error: "Query `kind` must be `donations` or `expenses`." },
      { status: 400 },
    );
  }

  const kind: FinanceSheetKind = kindParsed.data;
  const t = createAdminTranslator(SHEET_LOCALE);
  const dateLocale = adminDateLocaleTag(SHEET_LOCALE);

  const supabase = createServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY or URL missing on server." },
      { status: 503 },
    );
  }

  const limit = Math.min(
    500,
    Math.max(1, Number(url.searchParams.get("limit")) || 500),
  );

  const generatedAt = new Date().toLocaleString(dateLocale, {
    dateStyle: "full",
    timeStyle: "short",
  });

  const origin = url.origin;
  const cornerArt = resolveExportCornerArtUrls(origin);
  const siteBn = getSiteLocaleText("bn");
  const orgName = siteBn.name;
  const orgShortName = siteBn.shortName;
  const orgLocation = t("export.orgLocation");

  const baseDoc = {
    kind,
    origin,
    logoPath: siteConfig.logoSrc,
    orgName,
    orgShortName,
    orgLocation,
    sheetSubtitle: t("export.sheetSubtitle"),
    generatedLabel: t("export.generatedLabel"),
    generatedAt,
    printLabel: t("export.print"),
    closeLabel: t("export.close"),
    totalLabel: t("export.total"),
    documentFooter: t("export.documentFooter"),
    cornerArtLeftSrc: cornerArt.left,
    cornerArtLeftAlt: "ইসলামিক শোভা — বাম",
    cornerArtRightSrc: cornerArt.right,
    cornerArtRightAlt: "ইসলামিক শোভা — ডান",
  };

  if (kind === "donations") {
    const { data, error } = await supabase
      .from("donations")
      .select(DONATION_COLUMNS)
      .order("received_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const donations = (data ?? []) as DonationExportRow[];
    const total = sumBdtAmounts(donations);

    const html = buildFinanceExportHtmlDocument({
      ...baseDoc,
      sheetTitle: t("export.donationsSheetTitle"),
      recordCountText: t("export.recordCount", { count: donations.length }),
      emptyLabel: t("donationsTable.empty"),
      columns: [
        t("donationsTable.donor"),
        t("donationsTable.fathersName"),
        t("donationsTable.amount"),
        t("donationsTable.method"),
        t("donationsTable.note"),
        t("donationsTable.date"),
      ],
      rows: donationRowsForExport(donations, SHEET_LOCALE),
      totalAmountFormatted: formatPublicBdt(total, "bn"),
      amountColumnIndex: 2,
    });

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const { data, error } = await supabase
    .from("expenses")
    .select(
      "id, category, amount_bdt, description, beneficiary_note, spent_at, is_published",
    )
    .order("spent_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const expenses = (data ?? []) as ExpenseExportRow[];
  const total = sumBdtAmounts(expenses);

  const html = buildFinanceExportHtmlDocument({
    ...baseDoc,
    sheetTitle: t("export.expensesSheetTitle"),
    recordCountText: t("export.recordCount", { count: expenses.length }),
    emptyLabel: t("expensesTable.empty"),
    columns: [
      t("expensesTable.category"),
      t("expensesTable.amount"),
      t("expensesTable.description"),
      t("expensesTable.beneficiary"),
      t("expensesTable.date"),
    ],
    rows: expenseRowsForExport(expenses, SHEET_LOCALE),
    totalAmountFormatted: formatPublicBdt(total, "bn"),
    amountColumnIndex: 1,
  });

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
