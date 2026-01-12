import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration for Next.js 16
  turbopack: {},
  // Ensure these packages are not bundled and available at runtime (server-side only)
  serverExternalPackages: [
    'bufferutil',
    'utf-8-validate',
    '@stream-io/openai-realtime-api',
    'ws',
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle these native modules - they need to be available at runtime
      const externals = config.externals || [];
      config.externals = [
        ...(Array.isArray(externals) ? externals : [externals]),
        'bufferutil',
        'utf-8-validate',
      ].filter(Boolean);
    }
    return config;
  },
};

export default nextConfig;
