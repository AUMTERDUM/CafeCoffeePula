import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export configuration for low-memory deployment
  output: 'export',
  
  // Image optimization (use unoptimized for static export)
  images: {
    unoptimized: true,
  },
  
  // Trailing slash for better static hosting compatibility
  trailingSlash: true,
  
  // Base path (uncomment if deploying to subdirectory)
  // basePath: '/pos',
};

export default nextConfig;
