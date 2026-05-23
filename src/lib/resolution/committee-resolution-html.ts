import {
  SOLAIMAN_LIPI_FONT_FAMILY,
  solaimanLipiInlineFontFaceCss,
  solaimanLipiPrintHeadMarkup,
} from "@/lib/fonts/solaiman-lipi-print";
import {
  EXECUTIVE_TABLE_EXTRA_EMPTY_ROWS,
  type ResolutionDocumentContent,
  type ResolutionExecutiveRow,
} from "@/lib/resolution/resolution-document";

export type CommitteeResolutionHtmlInput = ResolutionDocumentContent & {
  origin: string;
  lang: string;
  logoPath: string;
  printLabel: string;
  closeLabel: string;
  printHint: string;
  documentFooter: string;
};

const ACCENT = {
  primary: "#0a7a45",
  primaryDark: "#065a32",
  header: "#0a5c34",
};

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

/** Escape text then render `**bold**` segments. */
function richText(text: string): string {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts
    .map((part, i) => (i % 2 === 1 ? `<strong>${e(part)}</strong>` : e(part)))
    .join("");
}

function resolveAssetUrl(origin: string, path: string): string {
  const base = origin.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

const BN_LIST_NUMS = [
  "১",
  "২",
  "৩",
  "৪",
  "৫",
  "৬",
  "৭",
  "৮",
  "৯",
  "১০",
  "১১",
  "১২",
  "১৩",
  "১৪",
] as const;

/** Ordered list with Bengali numerals (১. ২. …), not browser 1. 2. 3. */
function banglaNumberedList(items: string[]): string {
  const body = items
    .map((item, i) => {
      const num = BN_LIST_NUMS[i] ?? String(i + 1);
      return `<li><span class="bn-list-num" aria-hidden="true">${num}।</span> ${richText(item)}</li>`;
    })
    .join("");
  return `<ul class="styled-list bn-numbered">${body}</ul>`;
}

function decisionsHtml(
  decisions: ResolutionDocumentContent["decisions"],
): string {
  return decisions
    .map(
      (d) => `<div class="decision-item">
        <p class="decision-label">${e(d.label)}</p>
        <p class="decision-body">${richText(d.body)}</p>
      </div>`,
    )
    .join("");
}

function advisorTable(input: CommitteeResolutionHtmlInput): string {
  const rows = input.advisorRows
    .map(
      (row) => `<tr>
        <td class="num">${e(row.sl)}</td>
        <td>${e(row.name)}</td>
        <td>${e(row.fathersName)}</td>
      </tr>`,
    )
    .join("");

  return `<table class="data advisor-table">
    <thead>
      <tr>
        <th scope="col">${e(input.tableSl)}</th>
        <th scope="col">${e(input.tableName)}</th>
        <th scope="col">${e(input.tableFathersName)}</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

const BN_EXEC_SL = [
  "০১",
  "০২",
  "০৩",
  "০৪",
  "০৫",
  "০৬",
  "০৭",
  "০৮",
  "০৯",
  "১০",
  "১১",
  "১২",
  "১৩",
  "১৪",
  "১৫",
  "১৬",
  "১৭",
  "১৮",
] as const;

function slForExecutiveRow(index: number, lang: string): string {
  if (lang === "bn") return BN_EXEC_SL[index] ?? String(index + 1);
  return String(index + 1).padStart(2, "0");
}

function executiveRowsForPrint(
  rows: ResolutionExecutiveRow[],
  lang: string,
): ResolutionExecutiveRow[] {
  const padded = [...rows];
  const start = padded.length;
  for (let i = 0; i < EXECUTIVE_TABLE_EXTRA_EMPTY_ROWS; i++) {
    padded.push({
      sl: slForExecutiveRow(start + i, lang),
      name: "",
      fathersName: "",
      designation: "",
    });
  }
  return padded;
}

function executiveTable(input: CommitteeResolutionHtmlInput): string {
  const rows = executiveRowsForPrint(input.executiveRows, input.lang)
    .map(
      (row) => `<tr>
        <td class="num">${e(row.sl)}</td>
        <td>${e(row.name)}</td>
        <td>${e(row.fathersName)}</td>
        <td>${e(row.designation)}</td>
        <td class="signature" aria-label="${e(input.tableSignature)}"></td>
      </tr>`,
    )
    .join("");

  return `<table class="data exec-table">
    <thead>
      <tr>
        <th scope="col">${e(input.tableSl)}</th>
        <th scope="col">${e(input.tableName)}</th>
        <th scope="col">${e(input.tableFathersName)}</th>
        <th scope="col">${e(input.tableDesignation)}</th>
        <th scope="col">${e(input.tableSignature)}</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export function buildCommitteeResolutionHtmlDocument(
  input: CommitteeResolutionHtmlInput,
): string {
  const logoUrl = resolveAssetUrl(input.origin, input.logoPath);

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${e(input.documentSubtitle)}</title>
  ${solaimanLipiPrintHeadMarkup()}
  <style>
    ${solaimanLipiInlineFontFaceCss()}
    * { box-sizing: border-box; }
    html,
    body,
    button,
    table,
    th,
    td,
    h1, h2, h3, p, li, span, strong, div {
      font-family: ${SOLAIMAN_LIPI_FONT_FAMILY} !important;
      font-synthesis: none;
    }
    body {
      margin: 0;
      min-height: 100vh;
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
      margin-bottom: 12px;
    }
    .toolbar button {
      font: inherit;
      font-size: 15px;
      font-weight: 700;
      padding: 10px 22px;
      border-radius: 8px;
      cursor: pointer;
      border: 2px solid ${ACCENT.primaryDark};
      background: ${ACCENT.primary};
      color: #fff;
      min-width: 120px;
    }
    .toolbar button.secondary {
      background: #fff;
      color: ${ACCENT.primaryDark};
    }
    .toolbar button:hover { filter: brightness(1.05); }
    .print-hint {
      text-align: center;
      font-size: 14px;
      line-height: 1.55;
      color: #2e3136;
      margin-bottom: 16px;
      padding: 12px 14px;
      background: rgba(255, 255, 255, 0.92);
      border: 1px solid #c5c9ce;
      border-radius: 8px;
    }
    .sheet {
      position: relative;
      width: 210mm;
      max-width: 210mm;
      margin: 0 auto 32px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
      border: 1px solid #c5c9ce;
      overflow: visible;
    }
    .sheet-body {
      position: relative;
      overflow: visible;
    }
    .sheet-watermark {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
    }
    .sheet-watermark img {
      width: min(68%, 400px);
      height: auto;
      max-height: 72%;
      object-fit: contain;
      opacity: 0.14;
      user-select: none;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet-foreground {
      position: relative;
      z-index: 1;
    }
    .doc-title {
      margin: 0;
      padding: 18px 20px 12px;
      border-bottom: 2px solid ${ACCENT.primary};
      text-align: center;
      font-size: 2rem;
      font-weight: 800;
      color: #0f172a;
    }
    .sheet-content {
      position: relative;
      z-index: 1;
      padding: 14px 20px 16px;
      font-size: 0.9rem;
      line-height: 1.62;
      background: transparent;
    }
    .formation-meta {
      margin: 0 0 12px;
      padding: 10px 12px;
      background: rgba(240, 249, 244, 0.92);
      border: 1px solid #b8dcc8;
      border-radius: 6px;
      list-style: none;
    }
    .formation-meta li { margin: 0 0 4px; }
    .formation-meta li:last-child { margin-bottom: 0; }
    .section {
      margin-bottom: 14px;
    }
    .section h2 {
      margin: 0 0 8px;
      font-size: 1rem;
      font-weight: 800;
      color: ${ACCENT.primaryDark};
    }
    .section p {
      margin: 0;
      text-align: justify;
      color: #1e293b;
    }
    .styled-list {
      margin: 0;
      padding-left: 0;
      list-style: none;
    }
    .styled-list li {
      margin-bottom: 6px;
      text-align: justify;
      padding-left: 0;
    }
    .styled-list li:last-child { margin-bottom: 0; }
    .bn-list-num {
      font-weight: 700;
      color: ${ACCENT.primaryDark};
      margin-right: 0.2em;
    }
    .bn-numbered li {
      display: block;
    }
    .decision-item {
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px dashed #d1dce6;
    }
    .decision-item:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    .decision-label {
      margin: 0 0 4px;
      font-weight: 700;
      color: ${ACCENT.primaryDark};
    }
    .decision-body { margin: 0; }
    .objectives-list {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .objectives-list li {
      margin-bottom: 8px;
      padding-left: 0;
      text-align: justify;
    }
    table.data {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.86rem;
    }
    table.data thead { display: table-header-group; }
    table.data thead th {
      background: ${ACCENT.header};
      color: #fff;
      font-weight: 700;
      text-align: left;
      padding: 8px;
      border: 1px solid ${ACCENT.primaryDark};
    }
    table.data tbody tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    table.data tbody td {
      padding: 8px;
      border: 1px solid #b8c4d0;
      vertical-align: middle;
      background: transparent !important;
    }
    table.data td.num {
      width: 3rem;
      text-align: center;
    }
    table.data td.signature {
      width: 5.5rem;
      min-height: 2.75rem;
    }
    .sheet-footer {
      padding: 12px 20px 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 0.8rem;
      color: #64748b;
      text-align: center;
      background: #fafbfc;
    }
    @media print {
      html, body {
        background: #fff !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .screen-chrome { display: none !important; }
      .sheet {
        width: 210mm;
        max-width: 210mm;
        min-height: 0;
        margin: 0 auto;
        border: none;
        border-radius: 0;
        box-shadow: none;
        overflow: visible !important;
      }
      .doc-title {
        page-break-after: avoid;
        break-after: avoid-page;
      }
      .section h2 {
        page-break-after: avoid;
        break-after: avoid-page;
      }
      table.data thead th {
        background: ${ACCENT.header} !important;
        color: #fff !important;
      }
      .sheet-watermark {
        position: fixed;
        inset: 0;
        display: flex !important;
      }
      .sheet-watermark img {
        opacity: 0.2 !important;
        filter: none !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .section {
        page-break-inside: auto;
        break-inside: auto;
      }
      .decision-item {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .sheet-footer {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }
  </style>
  <style media="print">
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 14mm 14mm;
    }
  </style>
</head>
<body>
  <div class="screen-chrome">
    <p class="print-hint">${e(input.printHint)}</p>
    <div class="toolbar">
      <button type="button" onclick="(document.fonts&amp;&amp;document.fonts.ready?document.fonts.ready:Promise.resolve()).then(function(){window.print()})">${e(input.printLabel)}</button>
      <button type="button" class="secondary" onclick="window.close()">${e(input.closeLabel)}</button>
    </div>
  </div>
  <article class="sheet">
    <div class="sheet-body">
      <div class="sheet-watermark" aria-hidden="true">
        <img src="${e(logoUrl)}" alt="" width="400" height="400" decoding="async" />
      </div>
      <div class="sheet-foreground">
    <h2 class="doc-title">${e(input.documentSubtitle)}</h2>
    <div class="sheet-content">
      <ul class="formation-meta">
        <li>${e(input.formationDate)}</li>
        <li>${e(input.formationVenue)}</li>
        <li>${e(input.formationChair)}</li>
      </ul>

      <section class="section">
        <h2>${e(input.proposalTitle)}</h2>
        <p>${e(input.proposalBody)}</p>
      </section>

      <section class="section">
        <h2>${e(input.agendaTitle)}</h2>
        ${banglaNumberedList(input.agendaItems)}
      </section>

      <section class="section">
        <h2>${e(input.decisionsTitle)}</h2>
        ${decisionsHtml(input.decisions)}
      </section>

      <section class="section">
        <h2>${e(input.objectivesTitle)}</h2>
        <ul class="objectives-list">${input.objectives.map((o) => `<li>${richText(o)}</li>`).join("")}</ul>
      </section>

      <section class="section">
        <h2>${e(input.policiesTitle)}</h2>
        ${banglaNumberedList(input.policies)}
      </section>

      <section class="section">
        <h2>${e(input.advisorsTitle)}</h2>
        ${advisorTable(input)}
      </section>

      <section class="section">
        <h2>${e(input.executivesTitle)}</h2>
        ${executiveTable(input)}
      </section>
    </div>
    <footer class="sheet-footer">${e(input.documentFooter)}</footer>
      </div>
    </div>
  </article>
</body>
</html>`;
}
