import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent heavy server libraries from being re-bundled by the dev compiler
  serverExternalPackages: [
    "@composio/core",
    "@composio/client",
    "@neondatabase/serverless",
    "@browserbasehq/sdk",
    "stripe",
  ],

  // Fast barrel-file tree-shaking for icons and utility libraries
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@base-ui/react",
      "date-fns",
      "clsx",
      "tailwind-merge",
    ],
  },
};

export default nextConfig;
