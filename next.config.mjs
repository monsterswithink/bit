/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['bhswiskeqgfxsqtnvrpi.supabase.co', 'lh3.googleusercontent.com'],
    unoptimized: true,
  },
  experimental: {
    serverActions: true,
  },
}

export default nextConfig
