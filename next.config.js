/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@shopify/polaris'],
  experimental: {
    esmExternals: 'loose'
  },
  images: {
    domains: ['localhost'],
    unoptimized: true
  }
};

module.exports = nextConfig;