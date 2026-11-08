/** @type {import('next').NextConfig} */
const externalApiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Only rewrite to external backend if explicitly provided
    if (externalApiUrl && !externalApiUrl.includes('localhost')) {
      return [
        {
          source: '/api/:path*',
          destination: `${externalApiUrl.replace(/\/$/, '')}/:path*`,
        },
        {
          source: '/uploads/:path*',
          destination: `${externalApiUrl.replace(/\/api\/?$/, '')}/uploads/:path*`,
        },
      ];
    }
    return [];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
