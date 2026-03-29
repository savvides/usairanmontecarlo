import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
