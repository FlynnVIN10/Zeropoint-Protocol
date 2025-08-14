import createMDX from '@next/mdx';

const withMDX = createMDX({ extension: /\.mdx?$/ });

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  experimental: { mdxRs: true },
  eslint: { ignoreDuringBuilds: false },
  images: {
    unoptimized: true
  }
};

export default withMDX(nextConfig);
