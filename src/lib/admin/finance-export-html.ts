export type FinanceSheetKind = "donations" | "expenses";

export type FinanceExportHtmlInput = {
  kind: FinanceSheetKind;
  origin: string;
  logoPath: string;
  orgName: string;
  orgShortName: string;
  orgLocation: string;
  sheetTitle: string;
  sheetSubtitle: string;
  generatedLabel: string;
  generatedAt: string;
  recordCountText: string;
  printLabel: string;
  closeLabel: string;
  totalLabel: string;
  emptyLabel: string;
  documentFooter: string;
  cornerArtLeftSrc: string;
  cornerArtLeftAlt: string;
  cornerArtRightSrc: string;
  cornerArtRightAlt: string;
  columns: string[];
  rows: string[][];
  totalAmountFormatted: string;
  /** Zero-based index of the amount column for the totals row. */
  amountColumnIndex: number;
};

const SOLAIMAN_FONT_CSS = "https://fonts.maateen.me/solaiman-lipi/font.css";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function e(s: string): string {
  return escapeHtml(s);
}

function resolveAssetUrl(origin: string, path: string): string {
  const base = origin.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

function tableColgroup(kind: FinanceSheetKind): string {
  if (kind === "donations") {
    return `<colgroup>
      <col style="width:17%" />
      <col style="width:14%" />
      <col style="width:12%" />
      <col style="width:11%" />
      <col style="width:24%" />
      <col style="width:22%" />
    </colgroup>`;
  }
  return `<colgroup>
    <col style="width:14%" />
    <col style="width:12%" />
    <col style="width:30%" />
    <col style="width:22%" />
    <col style="width:22%" />
  </colgroup>`;
}

const ACCENT: Record<
  FinanceSheetKind,
  { primary: string; primaryDark: string; header: string }
> = {
  donations: {
    primary: "#0a7a45",
    primaryDark: "#065a32",
    header: "#0a5c34",
  },
  expenses: {
    primary: "#1d4ed8",
    primaryDark: "#1e3a8a",
    header: "#1e3a8a",
  },
};

export function buildFinanceExportHtmlDocument(
  input: FinanceExportHtmlInput,
): string {
  const accent = ACCENT[input.kind];
  const logoUrl = resolveAssetUrl(input.origin, input.logoPath);
  const colCount = Math.max(input.columns.length, 1);
  const amtIdx = Math.min(Math.max(0, input.amountColumnIndex), colCount - 1);

  const headCells = input.columns
    .map((col) => `<th scope="col">${e(col)}</th>`)
    .join("");

  const bodyRows =
    input.rows.length === 0
      ? `<tr class="empty-row"><td colspan="${colCount}">${e(input.emptyLabel)}</td></tr>`
      : input.rows
          .map((cells, i) => {
            const cellsHtml = cells
              .map((cell, ci) => {
                const numClass = ci === amtIdx ? ' class="num"' : "";
                return `<td${numClass}>${e(cell)}</td>`;
              })
              .join("");
            return `<tr>${cellsHtml}</tr>`;
          })
          .join("");

  const afterCols = colCount - amtIdx - 1;
  const footerRow =
    input.rows.length > 0
      ? `<tr class="total-row">
          <td colspan="${amtIdx}">${e(input.totalLabel)}</td>
          <td class="num total-amount">${e(input.totalAmountFormatted)}</td>
          ${afterCols > 0 ? `<td colspan="${afterCols}"></td>` : ""}
        </tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${e(input.sheetTitle)} — ${e(input.orgShortName)}</title>
  <link rel="stylesheet" href="${SOLAIMAN_FONT_CSS}" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: "Solaiman Lipi", "SolaimanLipi", ui-sans-serif, system-ui, sans-serif;
      background: #dfe2e6;
      color: #1a1a1c;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .screen-chrome {
      max-width: 1120px;
      margin: 0 auto;
      padding: 20px 16px 0;
    }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .toolbar button {
      font: inherit;
      font-size: 15px;
      font-weight: 700;
      padding: 10px 22px;
      border-radius: 8px;
      cursor: pointer;
      border: 2px solid ${accent.primaryDark};
      background: ${accent.primary};
      color: #fff;
      min-width: 120px;
    }
    .toolbar button.secondary {
      background: #fff;
      color: ${accent.primaryDark};
    }
    .toolbar button:hover { filter: brightness(1.05); }
    .sheet {
      position: relative;
      width: 100%;
      max-width: 210mm;
      margin: 0 auto 32px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
      border: 1px solid #c5c9ce;
      overflow: hidden;
    }
    .sheet-body {
      position: relative;
    }
    .sheet-header {
      position: relative;
      padding: 0 12px 22px;
      border-bottom: 3px solid ${accent.primary};
      background: linear-gradient(180deg, #fafcfd 0%, #fff 100%);
      overflow: visible;
    }
    .header-ornaments {
      position: relative;
      min-height: 182px;
      margin: 0;
      padding: 0;
    }
    .header-ornament {
      position: absolute;
      top: 0;
      margin: 0;
      padding: 0;
      width: 190px;
      height: auto;
      max-height: 183px;
      display: block;
      object-fit: contain;
      opacity: 1;
      border: none;
      box-shadow: none;
      background: transparent;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header-ornament-left {
      left: 0;
      object-position: left top;
      transform: scaleX(-1);
    }
    .header-ornament-right {
      right: 0;
      object-position: right top;
    }
    .brand {
      position: relative;
      z-index: 1;
      margin: 0 auto;
      padding: 10px 124px 0;
      max-width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      text-align: center;
    }
    .brand-logo {
      flex-shrink: 0;
      width: 108px;
      height: 108px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      box-shadow: none;
    }
    .brand-logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      image-rendering: -webkit-optimize-contrast;
    }
    .brand-text {
      width: 100%;
    }
    .brand-text h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 800;
      color: ${accent.primaryDark};
      line-height: 1.25;
    }
    .brand-text .short {
      margin: 8px 0 0;
      font-size: 1.05rem;
      font-weight: 600;
      color: #334155;
    }
    .brand-text .location {
      margin: 4px 0 0;
      font-size: 0.95rem;
      color: #64748b;
    }
    .sheet-meta {
      margin-top: 18px;
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid #e8edf2;
    }
    .sheet-meta h2 {
      margin: 0;
      font-size: 1.4rem;
      font-weight: 800;
      color: #0f172a;
    }
    .sheet-meta .subtitle {
      margin: 6px 0 0;
      font-size: 0.95rem;
      color: #64748b;
    }
    .sheet-meta .generated {
      margin: 0;
      font-size: 0.9rem;
      color: #475569;
      text-align: right;
    }
    .sheet-meta .generated .lbl {
      display: block;
      font-size: 0.8rem;
      color: #64748b;
      margin-bottom: 2px;
    }
    .sheet-meta .generated strong {
      color: #0f172a;
      font-weight: 700;
    }
    .table-wrap {
      position: relative;
      padding: 8px 16px 20px;
      overflow: visible;
      background: transparent;
    }
    .table-watermark {
      position: absolute;
      inset: 4px 8px 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
    }
    .table-watermark img {
      width: min(72%, 420px);
      height: auto;
      max-height: 90%;
      object-fit: contain;
      opacity: 0.16;
      user-select: none;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    table.data {
      position: relative;
      z-index: 1;
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
      font-size: 0.86rem;
      background: transparent;
    }
    table.data thead {
      display: table-header-group;
    }
    table.data thead th {
      background: ${accent.header};
      color: #fff;
      font-weight: 700;
      text-align: left;
      padding: 13px 12px;
      font-size: 0.88rem;
      border: 1px solid ${accent.primaryDark};
      white-space: nowrap;
    }
    table.data tbody td {
      padding: 9px 10px;
      border: 1px solid #b8c4d0;
      vertical-align: top;
      line-height: 1.45;
      background: transparent !important;
      word-wrap: break-word;
      overflow-wrap: anywhere;
    }
    table.data tbody tr.empty-row td {
      text-align: center;
      padding: 36px;
      color: #64748b;
      font-style: italic;
      background: transparent;
    }
    table.data tbody tr.total-row td {
      background: transparent;
      font-weight: 800;
      font-size: 1rem;
      border-top: 2px solid ${accent.primary};
      color: ${accent.primaryDark};
    }
    table.data td.num {
      text-align: right;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    table.data .total-amount {
      font-size: 1.08rem;
    }
    .sheet-footer {
      padding: 16px 28px 22px;
      border-top: 1px solid #e2e8f0;
      font-size: 0.82rem;
      color: #64748b;
      text-align: center;
      line-height: 1.5;
      background: #fafbfc;
    }
    .sheet-footer strong {
      display: block;
      margin-bottom: 4px;
      color: #334155;
      font-size: 0.88rem;
    }
    @media print {
      html,
      body {
        background: #fff !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .screen-chrome { display: none !important; }
      .sheet {
        width: 100%;
        max-width: none;
        margin: 0 auto;
        border: none;
        border-radius: 0;
        box-shadow: none;
        page-break-inside: avoid;
      }
      .header-ornament {
        display: block !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .table-watermark img,
      .brand-logo img {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .table-watermark {
        display: flex !important;
      }
      .table-watermark img {
        opacity: 0.22 !important;
        filter: none !important;
      }
      table.data thead th {
        background: ${accent.header} !important;
        color: #fff !important;
      }
    }
  </style>
  <style media="print">
    /* Default margins shown in browser print preview (top / right / bottom / left) */
    @page {
      size: A4 portrait;
      margin-top: 2mm;
      margin-right: 0mm;
      margin-bottom: 5mm;
      margin-left: 0mm;
    }
  </style>
</head>
<body>
  <div class="screen-chrome">
    <div class="toolbar">
      <button type="button" onclick="window.print()">${e(input.printLabel)}</button>
      <button type="button" class="secondary" onclick="window.close()">${e(input.closeLabel)}</button>
    </div>
  </div>
  <article class="sheet">
    <div class="sheet-body">
      <header class="sheet-header">
        <div class="header-ornaments">
          <img
            class="header-ornament header-ornament-left"
            src="${e(input.cornerArtLeftSrc)}"
            alt="${e(input.cornerArtLeftAlt)}"
            width="118"
            height="118"
            loading="eager"
            decoding="async"
          />
          <div class="brand">
            <div class="brand-logo">
              <img src="${e(logoUrl)}" alt="${e(input.orgShortName)}" width="96" height="96" />
            </div>
            <div class="brand-text">
              <h1>${e(input.orgName)}</h1>
            <p class="short">${e(input.sheetSubtitle)}</p>
            <p class="location">${e(input.orgLocation)}</p>
          </div>
        </div>
          <img
            class="header-ornament header-ornament-right"
            src="${e(input.cornerArtRightSrc)}"
            alt="${e(input.cornerArtRightAlt)}"
            width="118"
            height="118"
            loading="eager"
            decoding="async"
          />
        </div>
        <div class="sheet-meta">
          <div>
            <h2>${e(input.sheetTitle)}</h2>
            <p class="subtitle">${e(input.recordCountText)}</p>
          </div>
          <p class="generated">
            <span class="lbl">${e(input.generatedLabel)}</span>
            <strong>${e(input.generatedAt)}</strong>
          </p>
        </div>
      </header>
      <div class="table-wrap">
        <div class="table-watermark" aria-hidden="true">
          <img src="${e(logoUrl)}" alt="" width="400" height="400" />
        </div>
        <table class="data">
          ${tableColgroup(input.kind)}
          <thead><tr>${headCells}</tr></thead>
          <tbody>
            ${bodyRows}
            ${footerRow}
          </tbody>
        </table>
      </div>
      <footer class="sheet-footer">
        <strong>${e(input.orgName)}</strong>
        ${e(input.documentFooter)}
      </footer>
    </div>
  </article>
</body>
</html>`;
}
