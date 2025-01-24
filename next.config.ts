import type { NextConfig } from "next";
import type { Configuration as WebpackConfig } from "webpack";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  webpack: (config: WebpackConfig, { isServer }) => {
    if (!isServer) {
      // Ignore the punycode warning in client-side builds
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve?.fallback,
          punycode: false,
        },
      };
    }
    return config;
  },
};

export default nextConfig;
