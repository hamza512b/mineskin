import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const revision = crypto.randomUUID();

const withSerwist = withSerwistInit({
  cacheOnNavigation: true,
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  register: true,
});

const nextConfig: NextConfig = {
  // output: "export",
  redirects: async () => [
    {
      source: "/",
      destination: "/preview",
      permanent: false,
    },
  ],
};

export default withSerwist(nextConfig);
