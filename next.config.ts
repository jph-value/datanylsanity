import type { NextConfig } from "next";

const isGhPages = process.env.NEXT_PUBLIC_BASE_PATH?.length;

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath: isGhPages ? process.env.NEXT_PUBLIC_BASE_PATH : undefined,
  assetPrefix: isGhPages ? process.env.NEXT_PUBLIC_BASE_PATH : undefined,
};

export default nextConfig;
