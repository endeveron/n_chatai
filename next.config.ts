import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    qualities: [25, 50, 75, 100],
  },
};

export default nextConfig;
