import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features needed for the bot
  experimental: {
    // serverActions: true,
    serverComponentsExternalPackages: ['grammy', '@grammyjs/menu'],
  },

  // Server configuration
  serverExternalPackages: ['grammy', '@grammyjs/menu'],

  // Webpack configuration for external modules
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, {
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      }];
    }

    return config;
  },

  // Environment variables that will be inlined during build time
  env: {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    MINI_APP_URL: process.env.MINI_APP_URL || '',
  },

  // API and webhook configurations
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // Ensure API routes are handled correctly
  rewrites: async () => {
    return [
      {
        source: '/api/bot/:path*',
        destination: '/api/bot/:path*',
      },
    ];
  },
};

export default nextConfig;