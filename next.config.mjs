/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
  experimental: {},
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push('@next/swc-darwin-arm64')
    }
    return config
  },
}

export default nextConfig


