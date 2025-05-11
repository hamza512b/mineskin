import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects: async () => [
    {
      source: "/editor",
      destination: "/",
      permanent: false,
    },
  ],
};

export default nextConfig;
