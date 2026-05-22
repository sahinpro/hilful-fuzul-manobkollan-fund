/** CDN base for Solaiman Lipi (matches `src/app/layout.tsx` stylesheet). */
export const SOLAIMAN_LIPI_FONT_BASE = "https://fonts.maateen.me/solaiman-lipi";

export const SOLAIMAN_LIPI_FONT_CSS_URL = `${SOLAIMAN_LIPI_FONT_BASE}/font.css`;

/**
 * Must match `@font-face { font-family: 'SolaimanLipi' }` from maateen — not "Solaiman Lipi".
 */
export const SOLAIMAN_LIPI_FONT_FAMILY = "'SolaimanLipi', sans-serif";

/** Inline faces with absolute URLs so print/PDF loads fonts reliably. */
export function solaimanLipiInlineFontFaceCss(): string {
  const base = SOLAIMAN_LIPI_FONT_BASE;
  return `
@font-face {
  font-family: 'SolaimanLipi';
  font-display: swap;
  font-style: normal;
  font-weight: 100;
  src: url('${base}/solaimanlipi-thin-v1.0.woff2') format('woff2'),
       url('${base}/solaimanlipi-thin-v1.0.ttf') format('truetype');
}
@font-face {
  font-family: 'SolaimanLipi';
  font-display: swap;
  font-style: normal;
  font-weight: 400;
  src: url('${base}/solaimanlipi-normal-v1.0.woff2') format('woff2'),
       url('${base}/solaimanlipi-normal-v1.0.ttf') format('truetype');
}
@font-face {
  font-family: 'SolaimanLipi';
  font-display: swap;
  font-style: normal;
  font-weight: 700;
  src: url('${base}/solaimanlipi-bold-v1.0.woff2') format('woff2'),
       url('${base}/solaimanlipi-bold-v1.0.ttf') format('truetype');
}`;
}

export function solaimanLipiPrintHeadMarkup(): string {
  return `
  <link rel="preconnect" href="https://fonts.maateen.me" crossorigin />
  <link rel="preload" href="${SOLAIMAN_LIPI_FONT_BASE}/solaimanlipi-normal-v1.0.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="${SOLAIMAN_LIPI_FONT_BASE}/solaimanlipi-bold-v1.0.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="${SOLAIMAN_LIPI_FONT_CSS_URL}" />`;
}
