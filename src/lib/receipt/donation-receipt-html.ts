export type DonationReceiptHtmlInput = {
  receiptNo: string;
  /** Kept for API compatibility; not shown on the receipt. */
  bookNo?: string;
  donorName: string;
  donorPhone: string | null;
  amountBdt: string;
  paymentMethod: string;
  referenceNote: string | null;
  receivedAtIso: string;
  orgName: string;
  orgTagline: string;
  orgNameEn?: string;
  contactPhones: string;
  /** Full `https://` URL or path under site origin (e.g. `/signatures/chairman.png`). */
  chairmanSignatureSrc?: string | null;
  receiverSignatureSrc?: string | null;
};

function resolveReceiptAssetUrl(
  origin: string,
  src: string | null | undefined,
): string | null {
  const raw = src?.trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = origin.replace(/\/$/, "");
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${base}${path}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseAmountInt(s: string): number {
  const n = Number(String(s).replace(/,/g, "").trim());
  return Number.isFinite(n) ? Math.floor(Math.abs(n)) : 0;
}

const ONES = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

function under100(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return o ? `${TENS[t]}-${ONES[o]}` : TENS[t];
}

function under1000(n: number): string {
  if (n === 0) return "";
  if (n < 100) return under100(n);
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const head = `${ONES[h]} hundred`;
  if (rest === 0) return head;
  return `${head} ${under100(rest)}`;
}

function amountToEnglishWordsBdt(n: number): string {
  if (n === 0) return "zero taka only";
  if (n >= 100_000_000) return "amount in figures only";

  const chunks: string[] = [];
  let rem = n;

  const crore = Math.floor(rem / 10_000_000);
  rem %= 10_000_000;
  if (crore) chunks.push(`${under1000(crore)} crore`.trim());

  const lakh = Math.floor(rem / 100_000);
  rem %= 100_000;
  if (lakh) chunks.push(`${under100(lakh)} lakh`.trim());

  const thousand = Math.floor(rem / 1000);
  rem %= 1000;
  if (thousand) chunks.push(`${under100(thousand)} thousand`.trim());

  if (rem) chunks.push(under1000(rem));

  return `${chunks.join(" ").replace(/\s+/g, " ").trim()} taka only`;
}

function formatBdtBn(amountBdt: string): string {
  const n = Number(String(amountBdt).replace(/,/g, "").trim());
  if (!Number.isFinite(n)) return amountBdt.trim() || "০";
  return Math.round(n).toLocaleString("bn-BD", { maximumFractionDigits: 0 });
}

const SOLAIMAN_FONT_CSS = "https://fonts.maateen.me/solaiman-lipi/font.css";

/**
 * Printable HTML receipt (browser Print → Save as PDF).
 * Typography matches the main app: Solaiman Lipi via fonts.maateen.me (see `src/app/layout.tsx`).
 */
export function buildDonationReceiptHtmlDocument(
  origin: string,
  input: DonationReceiptHtmlInput,
): string {
  const dash = "—";
  const donorName = input.donorName.trim() || dash;
  const purpose = input.referenceNote?.trim() || `দান (${input.paymentMethod})`;
  const purposeShort =
    purpose.length > 100 ? `${purpose.slice(0, 97)}…` : purpose;

  const amountInt = parseAmountInt(input.amountBdt);
  const amountWords = amountToEnglishWordsBdt(amountInt);
  const amountDisplay = formatBdtBn(input.amountBdt);
  const dateStr = new Date(input.receivedAtIso).toLocaleDateString("bn-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const logoUrl = `${origin.replace(/\/$/, "")}/logo.png`;

  const e = escapeHtml;
  const chairmanSigUrl = resolveReceiptAssetUrl(
    origin,
    input.chairmanSignatureSrc,
  );
  const receiverSigUrl = resolveReceiptAssetUrl(
    origin,
    input.receiverSignatureSrc,
  );
  // Chairman slot uses receiver image when no chairman asset is configured.
  const chairmanDisplayUrl = chairmanSigUrl ?? receiverSigUrl ?? null;
  const chairmanSigHtml = chairmanDisplayUrl
    ? `<div class="sign-img-wrap"><img class="sign-img" src="${e(chairmanDisplayUrl)}" alt="" decoding="async" /></div>`
    : "";
  const receiverSigHtml = receiverSigUrl
    ? `<div class="sign-img-wrap"><img class="sign-img" src="${e(receiverSigUrl)}" alt="" decoding="async" /></div>`
    : "";
  const orgName = e(input.orgName.trim());
  const orgTagline = e(input.orgTagline.trim());
  const orgNameEn = e(
    input.orgNameEn?.trim() || "Hilful Fuzul Manobkallyan Fund",
  );
  const contact = e(input.contactPhones.trim());
  const receiptNoSafe = e(input.receiptNo);

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${e(`রসিদ ${input.receiptNo}`)}</title>
  <link rel="stylesheet" href="${SOLAIMAN_FONT_CSS}" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px 16px;
      font-family: "Solaiman Lipi", "SolaimanLipi", ui-sans-serif, system-ui, sans-serif;
      background: #dfe2e6;
      color: #1a1a1c;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .shell {
      width: 100%;
      max-width: 792px;
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }
    .hint {
      text-align: center;
      font-size: 14px;
      line-height: 1.55;
      color: #2e3136;
      margin-bottom: 16px;
      padding: 12px 14px;
      background: rgba(255, 255, 255, 0.88);
      border: 1px solid #c5c9ce;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    }
    .hint strong { font-weight: 700; color: #111; }
    .receipt-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 12px 16px;
      margin-top: 20px;
      padding: 0 8px;
    }
    .receipt-actions .btn {
      font: inherit;
      font-size: 15px;
      font-weight: 700;
      padding: 10px 24px;
      border-radius: 8px;
      cursor: pointer;
      border: 2px solid #1a5c38;
      background: rgb(0, 144, 81);
      color: #fff;
      min-width: 132px;
      -webkit-tap-highlight-color: transparent;
    }
    .receipt-actions .btn:hover {
      filter: brightness(1.06);
    }
    .receipt-actions .btn:focus-visible {
      outline: 2px solid #1a5c38;
      outline-offset: 2px;
    }
    .receipt-actions .btn-secondary {
      border-color: #9a1520;
      background: rgb(237, 28, 36);
      color: #fff;
    }
    .receipt-actions .btn-secondary:focus-visible {
      outline-color: #9a1520;
    }
    @media print {
      body {
        background: #fff;
        padding: 0;
        justify-content: flex-start;
        min-height: auto;
      }
      .shell { max-width: none; }
      .card { box-shadow: none; border-radius: 0; }
      .hint { display: none !important; }
      .receipt-actions { display: none !important; }
    }
    .card {
      width: 100%;
      background: #fff;
      overflow: hidden;
      border-radius: 2px;
      box-shadow: 0 2px 12px rgba(0,0,0,.08);
    }
    .band-green {
      background: rgb(0, 144, 81);
      color: #fff;
      text-align: center;
      padding: 11px 14px;
      font-size: 17px;
      font-weight: 600;
    }
    .band-peach {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 10px 14px;
      align-items: center;
      padding: 12px 16px;
      background: rgb(255, 237, 224);
    }
    .peach-left .en { color: rgb(237, 28, 36); font-size: 14px; font-weight: 700; line-height: 1.3; }
    .peach-left .addr { color: rgb(0, 144, 81); font-size: 12px; margin-top: 5px; line-height: 1.45; }
    .peach-mid img { display: block; width: 54px; height: auto; margin: 0 auto; }
    .peach-right { text-align: right; }
    .peach-right .bn { color: rgb(237, 28, 36); font-size: 14px; font-weight: 700; line-height: 1.3; }
    .peach-right .addr { color: rgb(0, 144, 81); font-size: 12px; margin-top: 5px; line-height: 1.45; }
    .body {
      background: rgb(224, 242, 241);
      padding: 14px 18px 16px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px 12px;
      margin-bottom: 14px;
      font-size: 13px;
      line-height: 1.4;
    }
    @media (max-width: 720px) {
      .meta-grid { grid-template-columns: 1fr; }
    }
    .meta-inline {
      font-weight: 600;
      word-break: break-word;
    }
    .meta-inline .meta-lbl {
      color: rgb(0, 120, 70);
    }
    .meta-inline .meta-val {
      color: #111;
      font-weight: 700;
    }
    .field-row {
      display: flex;
      align-items: flex-start;
      gap: 8px 12px;
      margin-bottom: 12px;
      font-size: 13px;
      font-weight: 600;
    }
    .field-row .lbl {
      flex-shrink: 0;
      white-space: nowrap;
      padding-top: 2px;
      color: rgb(237, 28, 36);
    }
    .field-val-col {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .field-val-col .val {
      color: #111;
      font-weight: 700;
      text-align: left;
      word-break: break-word;
      line-height: 1.35;
    }
    .field-dots {
      width: 100%;
      border-bottom: 1px dotted #4a4d52;
      height: 1.05em;
      min-height: 14px;
      margin-top: -15px;
    }
    .row-line {
      display: flex;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 8px 12px;
      margin-bottom: 12px;
      font-size: 13px;
      font-weight: 600;
      color: rgb(237, 28, 36);
    }
    .row-line .lbl {
      flex-shrink: 0;
      white-space: nowrap;
    }
    .amt-box {
    border: 1px dotted #2222222e;
    background: #fff5f5;
    padding: 3px 12px 4px;
    min-width: 92px;
    text-align: center;
    border-radius: 5px;
    font-size: 15px;
    font-weight: 700;
    color: #111;
}
    .row-line.amt-row .lbl { padding-bottom: 4px; }
    .field-row--spacing-before-sign {
      margin-bottom: 8px;
    }
    .sign {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 10px;
      padding-top: 8px;
    }
    .sign-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 0;
      
    }
    .sign-img-wrap {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: flex-end;
      margin-bottom: 6px;
      min-height: 55px;
    }
    .sign-img {
      max-height: 50px;
     max-width: min(220px, 100%);
      width: auto;
      min-height: 50px;
      height: auto;
      object-fit: contain;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sign-line-wrap {
      width: 100%;
      border-top: 1px solid #666;
      padding-top: 8px;
      font-size: 12px;
      font-weight: 700;
      color: rgb(0, 120, 70);
      text-align: center;
    }
    .band-red {
      background: rgb(237, 28, 36);
      color: #fff;
      text-align: center;
      padding: 11px 14px;
      font-size: 13px;
      line-height: 1.5;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="shell">
    <aside class="hint" role="note">
      ব্রাউজারে <strong>Ctrl+P</strong> (ম্যাকে <strong>⌘+P</strong>) চেপে প্রিন্ট করুন, অথবা নিচের <strong>Print</strong> / <strong>Save as PDF</strong> বাটন ব্যবহার করুন।
      PDF সংরক্ষণের সময় প্রিন্ট উইন্ডোতে <strong>Destination</strong> হিসেবে <strong>Save as PDF</strong> বাছুন।
      <span lang="en"><br /><span class="hint-en">Press <strong>Ctrl+P</strong> / <strong>⌘+P</strong>, or use the buttons below. For a file, pick <strong>Save as PDF</strong> in the print dialog.</span></span>
    </aside>
    <div class="card">
      <div class="band-green">দান রসিদ · Donation receipt</div>
      <div class="band-peach">
        <div class="peach-left">
          <div class="en">${orgNameEn}</div>
          <div class="addr">${orgTagline}</div>
        </div>
        <div class="peach-mid"><img src="${logoUrl}" width="54" height="54" alt="" /></div>
        <div class="peach-right">
          <div class="bn">${orgName}</div>
          <div class="addr">${orgTagline}</div>
        </div>
      </div>
      <div class="body">
        <div class="meta-grid">
          <div class="meta-inline"><span class="meta-lbl">Receipt No / ক্রমিক নং :</span> <span class="meta-val">${receiptNoSafe}</span></div>
          <div class="meta-inline"><span class="meta-lbl">Date / তারিখ :</span> <span class="meta-val">${e(dateStr)}</span></div>
        </div>
        <div class="field-row">
          <span class="lbl">Donor / দাতা :</span>
          <div class="field-val-col">
            <span class="val">${e(donorName)}</span>
            <div class="field-dots" aria-hidden="true"></div>
          </div>
        </div>
        
        <div class="row-line amt-row">
          <span class="lbl">Amount / পরিমাণ :</span>
          <span class="amt-box">${e(amountDisplay)} ৳ </span>
        </div>
        <div class="field-row">
          <span class="lbl">Purpose / বাবদ :</span>
          <div class="field-val-col">
            <span class="val">${e(purposeShort)}</span>
            <div class="field-dots" aria-hidden="true"></div>
          </div>
        </div>
        <div class="field-row field-row--spacing-before-sign">
          <span class="lbl">In words / কথায় :</span>
          <div class="field-val-col">
            <span class="val">${e(amountWords)}</span>
            <div class="field-dots" aria-hidden="true"></div>
          </div>
        </div>
        <div class="sign">
          <div class="sign-cell ">
            ${chairmanSigHtml}
            <div class="sign-line-wrap">Chairman / সভাপতি</div>
          </div>
          <div class="sign-cell">
            ${receiverSigHtml}
            <div class="sign-line-wrap">Receiver / আদায়কারী</div>
          </div>
        </div>
      </div>
      <div class="band-red">${contact} · আপনার সহযোগিতার জন্য কৃতজ্ঞতা।</div>
    </div>
    <div class="receipt-actions" role="toolbar" aria-label="রসিদ প্রিন্ট ও সংরক্ষণ">
      <button type="button" class="btn" onclick="window.print()">Print</button>
      <button
        type="button"
        class="btn btn-secondary"
        onclick="window.print()"
        title="প্রিন্ট ডায়ালগে Destination হিসেবে Save as PDF বা Microsoft Print to PDF বাছুন। In the print dialog, choose Save as PDF as the destination."
      >
        Save as PDF
      </button>
    </div>
  </div>
</body>
</html>`;
}
