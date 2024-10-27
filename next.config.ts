import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: { // [!code ++]
    serverComponentsExternalPackages: ['grammy'], // [!code ++]
  }, // [!code ++]
};

export default nextConfig;
