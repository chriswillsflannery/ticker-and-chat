import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'asc-dpr-public.s3.us-east-2.amazonaws.com',
        port: '',
        pathname: '/logos/**',
      },
    ]
  }
};

export default nextConfig;
