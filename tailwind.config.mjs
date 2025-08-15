export default {
  content: ['./src/**/*.{astro,md,mdx,js,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)', panel: 'var(--panel)', elev: 'var(--elev)',
        text: 'var(--text)', sub: 'var(--sub)', link: 'var(--link)',
        ok: 'var(--ok)', warn: 'var(--warn)', err: 'var(--err)', border: 'var(--border)'
      },
      borderRadius: { xl: '16px', lg: '24px', md: '10px' },
      boxShadow: { brand: '0 10px 30px rgba(0,0,0,.35)' },
      fontFamily: { sans: ['Inter','system-ui','sans-serif'] }
    }
  },
  plugins: []
};
