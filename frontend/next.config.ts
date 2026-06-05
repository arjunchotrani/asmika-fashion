import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        // Cloudflare R2 public bucket
        protocol: 'https',
        hostname: 'pub-2e8934d1400a4280865e79f48d0ce96c.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        // Generic R2 dev URLs
        protocol: 'https',
        hostname: '*.r2.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
