const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  defaultShowCopyCode: true,
  flexsearch: true,
  staticImage: true,
})

module.exports = withNextra({
  // Next.js config
  experimental: {
    appDir: true,
  },
  // Cloudflare Pages adapter
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
})
