/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx'],
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Handle sql.js WASM and native modules
  experimental: {
    serverComponentsExternalPackages: ['sql.js'],
  },
  
  webpack: (config, { isServer }) => {
    // Handle sql.js properly
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('sql.js');
    }
    
    // Ignore WASM files in client bundle
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    
    return config;
  },
  
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
