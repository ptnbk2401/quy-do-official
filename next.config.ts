import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
    ],
  },
  // Allow large file uploads (200MB for videos)
  experimental: {
    serverActions: {
      bodySizeLimit: "200mb",
    },
  },
  // Cache headers for better performance
  async headers() {
    return [
      {
        source: "/api/auth/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
      {
        source: "/((?!api/auth).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  // Tắm ESLint trong production build (uncomment nếu cần)
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  // Tắt TypeScript errors trong production build (uncomment nếu cần)
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
};

export default nextConfig;
