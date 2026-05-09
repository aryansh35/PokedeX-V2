import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.3.122.34'],
  experimental: {
    globalNotFound: true,
  },
  images: {
    qualities: [75, 85, 95, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'academia.srmist.edu.in',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
