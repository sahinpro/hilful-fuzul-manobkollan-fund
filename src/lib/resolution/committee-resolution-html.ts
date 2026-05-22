import {
  SOLAIMAN_LIPI_FONT_FAMILY,
  solaimanLipiInlineFontFaceCss,
  solaimanLipiPrintHeadMarkup,
} from "@/lib/fonts/solaiman-lipi-print";
import type { ResolutionDocumentContent } from "@/lib/resolution/resolution-document";

export type CommitteeResolutionHtmlInput = ResolutionDocumentContent & {
  origin: string;
  lang: string;
  logoPath: string;
  orgName: string;
  orgLocation: string;
  printLabel: string;
  closeLabel: string;
  printHint: string;
  documentFooter: string;
  cornerArtLeftSrc: string;
  cornerArtLeftAlt: string;
  cornerArtRightSrc: string;
  cornerArtRightAlt: string;
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

function decisionsHtml(decisions: ResolutionDocumentContent["decisions"]): string {
  return decisions
    .map(
      (d) => `<div class="decision-item">
        <p class="decision-label">${e(d.label)}</p>
        <p class="decision-body">${richText(d.body)}</p>
      </div>`,
    )
    .join("");
}

function advisorGrid(names: string[]): string {
  const cells = names
    .map((name) => `<div class="advisor-cell">${e(name)}</div>`)
    .join("");
  return `<div class="advisor-grid">${cells}</div>`;
}

function executiveTable(input: CommitteeResolutionHtmlInput): string {
  const rows = input.executiveRows
    .map(
      (row) => `<tr>
        <td class="num">${e(row.sl)}</td>
        <td>${e(row.name)}</td>
        <td>${e(row.fathersName)}</td>
        <td>${e(row.designation)}</td>
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
  <title>${e(input.documentTitle)} — ${e(input.orgName)}</title>
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
    .sheet-header {
      position: relative;
      padding: 0 12px 14px;
      border-bottom: 3px solid ${ACCENT.primary};
      background: linear-gradient(180deg, #fafcfd 0%, #fff 100%);
    }
    .header-ornaments { position: relative; min-height: 158px; }
    .header-ornament {
      position: absolute;
      top: 0;
      width: 150px;
      max-height: 158px;
      object-fit: contain;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header-ornament-left { left: 0; transform: scaleX(-1); }
    .header-ornament-right { right: 0; }
    .brand {
      position: relative;
      z-index: 1;
      margin: 0 auto;
      padding: 6px 100px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 8px;
    }
    .brand-logo img { width: 76px; height: 76px; object-fit: contain; }
    .brand h1 {
      margin: 0;
      font-size: 1.45rem;
      font-weight: 800;
      color: ${ACCENT.primaryDark};
      line-height: 1.3;
    }
    .brand .location {
      margin: 2px 0 0;
      font-size: 0.9rem;
      color: #64748b;
    }
    .doc-title {
      margin: 0;
      padding: 12px 20px 0;
      text-align: center;
      font-size: 1.2rem;
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
    .advisor-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 14px;
      font-size: 0.86rem;
    }
    .advisor-cell {
      padding: 6px 8px;
      border: 1px solid #c5d4e0;
      border-radius: 4px;
      line-height: 1.4;
      background: rgba(255, 255, 255, 0.72);
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
    .signature-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      margin-top: 22px;
      padding-top: 14px;
      border-top: 2px solid ${ACCENT.primary};
      page-break-inside: avoid;
    }
    .signature-slot {
      text-align: center;
      font-size: 0.84rem;
      font-weight: 600;
      color: #334155;
    }
    .signature-slot .line {
      margin-top: 42px;
      border-top: 1px solid #94a3b8;
      padding-top: 6px;
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
      .sheet-header {
        page-break-after: avoid;
        break-after: avoid-page;
      }
      .doc-title {
        page-break-after: avoid;
        break-after: avoid-page;
      }
      .section h2 {
        page-break-after: avoid;
        break-after: avoid-page;
      }
      .header-ornament {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
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
      .signature-row {
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
    <header class="sheet-header">
      <div class="header-ornaments">
        <img class="header-ornament header-ornament-left" src="${e(input.cornerArtLeftSrc)}" alt="${e(input.cornerArtLeftAlt)}" width="118" height="118" decoding="async" />
        <div class="brand">
          <div class="brand-logo"><img src="${e(logoUrl)}" alt="" width="76" height="76" decoding="async" /></div>
          <div>
            <h1>${e(input.orgName)}</h1>
            <p class="location">${e(input.orgLocation)}</p>
          </div>
        </div>
        <img class="header-ornament header-ornament-right" src="${e(input.cornerArtRightSrc)}" alt="${e(input.cornerArtRightAlt)}" width="118" height="118" decoding="async" />
      </div>
    </header>
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
        ${advisorGrid(input.advisorNames)}
      </section>

      <section class="section">
        <h2>${e(input.executivesTitle)}</h2>
        ${executiveTable(input)}
        <div class="signature-row">
          <div class="signature-slot"><div class="line">${e(input.signatureChair)}</div></div>
          <div class="signature-slot"><div class="line">${e(input.signatureSecretary)}</div></div>
          <div class="signature-slot"><div class="line">${e(input.signatureCashier)}</div></div>
        </div>
      </section>
    </div>
    <footer class="sheet-footer">${e(input.documentFooter)}</footer>
      </div>
    </div>
  </article>
</body>
</html>`;
}
