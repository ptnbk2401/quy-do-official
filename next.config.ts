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
