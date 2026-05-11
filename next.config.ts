import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Bangla → ASCII routing is handled in `src/middleware.ts` (rewrites + RSC navigations).
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
