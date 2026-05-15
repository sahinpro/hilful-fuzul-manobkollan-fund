/** Next.js `cacheLife` profile names (see `next.config.ts`). */
export const PUBLIC_CACHE_PROFILES = {
  finance: "publicFinance",
  leadership: "publicLeadership",
} as const;

/** Tags for `unstable_cache` / `revalidateTag`. */
export const PUBLIC_CACHE_TAGS = {
  transparencyTotals: "public:transparency-totals",
  transparencyLedger: "public:transparency-ledger",
  leadership: "public:leadership",
} as const;
