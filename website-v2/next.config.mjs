import nextra from 'nextra';

const withNextra = nextra({
  defaultShowCopyCode: true,
  staticImage: true
});

export default withNextra({
  output: 'standalone',
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Cloudflare Pages specific config
  experimental: {
    runtime: 'edge'
  }
});
