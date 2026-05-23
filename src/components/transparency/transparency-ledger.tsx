import {
  fetchTransparencyLedger,
  isSupabaseConfigured,
  type LedgerRow,
} from "@/lib/finance/transparency";
import { formatPublicBdt, type PublicLocale } from "@/lib/i18n/format-digits";
import { getSiteTranslator } from "@/lib/i18n/site-server";

function formatOccurredAt(iso: string, locale: PublicLocale): string {
  const tag = locale === "en" ? "en-GB" : "bn-BD";
  try {
    return new Date(iso).toLocaleDateString(tag, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function kindLabel(kind: string, t: (key: string) => string): string {
  if (kind === "donation") return t("pages.transparency.kind.donation");
  if (kind === "expense") return t("pages.transparency.kind.expense");
  return kind;
}

function ledgerAmount(
  row: LedgerRow,
  locale: PublicLocale,
): { text: string; className: string } {
  const inn = row.amount_in != null ? Number(row.amount_in) : 0;
  const out = row.amount_out != null ? Number(row.amount_out) : 0;
  if (row.kind === "donation" && inn > 0) {
    return {
      text: `+ ${formatPublicBdt(inn, locale)}`,
      className: "text-emerald-600 dark:text-emerald-400",
    };
  }
  if (row.kind === "expense" && out > 0) {
    return {
      text: `− ${formatPublicBdt(out, locale)}`,
      className: "text-rose-600 dark:text-rose-400",
    };
  }
  return { text: "—", className: "text-muted-foreground" };
}

export async function TransparencyLedger() {
  const { locale, t } = await getSiteTranslator();
  const configured = isSupabaseConfigured();
  const ledger = await fetchTransparencyLedger(200);

  const ledgerNote = !configured
    ? t("pages.transparency.ledgerNote.noEnv")
    : ledger.length === 0
      ? t("pages.transparency.ledgerNote.empty")
      : null;

  return (
    <div className="ios-card overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">{t("pages.transparency.table.date")}</th>
            <th className="px-4 py-3 font-semibold">{t("pages.transparency.table.kind")}</th>
            <th className="px-4 py-3 font-semibold">
              {t("pages.transparency.table.description")}
            </th>
            <th className="px-4 py-3 font-semibold">{t("pages.transparency.table.amount")}</th>
          </tr>
        </thead>
        <tbody>
          {ledger.length === 0 ? (
            <tr className="border-t border-border">
              <td className="px-4 py-3 text-muted-foreground" colSpan={4}>
                {ledgerNote ?? "—"}
              </td>
            </tr>
          ) : (
            ledger.map((row) => {
              const amt = ledgerAmount(row, locale);
              return (
                <tr key={`${row.kind}-${row.id}`} className="border-t border-border">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatOccurredAt(row.occurred_at, locale)}
                  </td>
                  <td className="px-4 py-3">{kindLabel(row.kind, t)}</td>
                  <td className="px-4 py-3">{row.description?.trim() || "—"}</td>
                  <td
                    className={`px-4 py-3 font-medium tabular-nums ${amt.className}`}
                  >
                    {amt.text}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
