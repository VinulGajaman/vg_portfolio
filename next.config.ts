import type { NextConfig } from "next";

/**
 * Static export (DESIGN.md §7.1). No Server Actions, no default image loader,
 * dynamic routes need generateStaticParams + dynamicParams = false.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
