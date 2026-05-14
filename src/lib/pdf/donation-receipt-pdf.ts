import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/** Noto Sans Bengali (hinted TTF) for Bangla donor names and notes. */
const NOTO_SANS_BENGALI_TTF =
  "https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansBengali/NotoSansBengali-Regular.ttf";

export type DonationReceiptPdfInput = {
  receiptNo: string;
  donorName: string;
  amountBdt: string;
  paymentMethod: string;
  referenceNote: string | null;
  receivedAtIso: string;
  /** Organization display name (may include Bangla). */
  orgName: string;
  /** Short line under title. */
  orgTagline: string;
};

function wrapLines(text: string, maxCharsPerLine: number): string[] {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return [];
  const lines: string[] = [];
  let rest = t;
  while (rest.length > 0) {
    if (rest.length <= maxCharsPerLine) {
      lines.push(rest);
      break;
    }
    const chunk = rest.slice(0, maxCharsPerLine);
    const lastSpace = chunk.lastIndexOf(" ");
    const cut = lastSpace > maxCharsPerLine * 0.55 ? lastSpace : maxCharsPerLine;
    lines.push(rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).trimStart();
  }
  return lines;
}

export async function buildDonationReceiptPdf(input: DonationReceiptPdfInput): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`Receipt ${input.receiptNo}`);
  pdfDoc.setAuthor(input.orgName);

  let bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  try {
    const res = await fetch(NOTO_SANS_BENGALI_TTF, { cache: "force-cache" });
    if (res.ok) {
      const bytes = new Uint8Array(await res.arrayBuffer());
      bodyFont = await pdfDoc.embedFont(bytes, { subset: true });
    }
  } catch {
    /* keep Helvetica */
  }

  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const margin = 48;
  const accent = rgb(0.12, 0.55, 0.28);
  const muted = rgb(0.35, 0.35, 0.38);
  const ink = rgb(0.1, 0.1, 0.12);

  let y = height - margin;

  page.drawRectangle({
    x: margin - 8,
    y: y - 4,
    width: width - 2 * (margin - 8),
    height: 3,
    color: accent,
  });
  y -= 28;

  page.drawText(input.orgName, {
    x: margin,
    y,
    size: 16,
    font: bodyFont,
    color: ink,
    maxWidth: width - 2 * margin,
  });
  y -= 22;
  page.drawText(input.orgTagline, {
    x: margin,
    y,
    size: 10,
    font: bodyFont,
    color: muted,
    maxWidth: width - 2 * margin,
  });
  y -= 36;

  page.drawText("Donation receipt / দান রসিদ", {
    x: margin,
    y,
    size: 20,
    font: boldFont,
    color: accent,
  });
  y -= 40;

  page.drawText("Receipt no. / রসিদ নং", {
    x: margin,
    y,
    size: 10,
    font: boldFont,
    color: muted,
  });
  y -= 18;
  page.drawText(input.receiptNo, {
    x: margin,
    y,
    size: 14,
    font: boldFont,
    color: ink,
  });
  y -= 36;

  const receivedLabel = new Date(input.receivedAtIso).toLocaleString("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const rows: [string, string][] = [
    ["Donor / দাতা", input.donorName || "—"],
    ["Amount (BDT) / পরিমাণ", input.amountBdt],
    ["Method / মাধ্যম", input.paymentMethod],
    ["Received / গ্রহণের সময়", receivedLabel],
  ];
  if (input.referenceNote?.trim()) {
    rows.push(["Note / নোট", input.referenceNote.trim()]);
  }

  const labelW = 150;
  for (const [label, value] of rows) {
    page.drawText(label, {
      x: margin,
      y,
      size: 10,
      font: boldFont,
      color: muted,
    });
    const valueLines = wrapLines(value, 52);
    let lineY = y;
    for (const line of valueLines) {
      page.drawText(line, {
        x: margin + labelW,
        y: lineY,
        size: 11,
        font: bodyFont,
        color: ink,
        maxWidth: width - margin - labelW - margin,
      });
      lineY -= 14;
    }
    y = lineY - 10;
  }

  page.drawLine({
    start: { x: margin, y: y + 20 },
    end: { x: width - margin, y: y + 20 },
    thickness: 0.5,
    color: rgb(0.85, 0.87, 0.88),
  });

  page.drawText("Thank you for your support.", {
    x: margin,
    y: 100,
    size: 10,
    font: bodyFont,
    color: muted,
  });
  page.drawText("This document was generated from the Hilful Fuzul admin system.", {
    x: margin,
    y: 82,
    size: 8,
    font: bodyFont,
    color: muted,
    maxWidth: width - 2 * margin,
  });

  return pdfDoc.save();
}
