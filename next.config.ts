import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const revision = crypto.randomUUID();

const withSerwist = withSerwistInit({
  cacheOnNavigation: true,
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/en/~offline", revision }],
  register: true,
});

const nextConfig: NextConfig = {
  // output: "export",
};

export default withSerwist(nextConfig);
