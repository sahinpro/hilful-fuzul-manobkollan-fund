import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheLife: {
    /** Donation/expense totals & ledger — refresh often, purge on admin writes. */
    publicFinance: {
      stale: 60,
      revalidate: 120,
      expire: 3600,
    },
    /** Leadership roster — changes rarely. */
    publicLeadership: {
      stale: 300,
      revalidate: 600,
      expire: 86400,
    },
  },
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/logo.png" }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "images.pexels.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
