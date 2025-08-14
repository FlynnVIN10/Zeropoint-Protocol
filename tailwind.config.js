/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        muted: "var(--muted)",
        elev: "var(--elev)",
        text: "var(--text)",
        sub: "var(--sub)",
        link: "var(--link)",
        ok: "var(--ok)",
        warn: "var(--warn)",
        err: "var(--err)",
        border: "var(--border)",
        ring: "var(--ring)",
      },
      borderRadius: {
        xl: "var(--radius)",
        lg: "var(--radius-lg)",
        md: "var(--radius-sm)",
      },
      boxShadow: {
        brand: "var(--shadow)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '1.35' }],
        'sm': ['14px', { lineHeight: '1.55' }],
        'base': ['16px', { lineHeight: '1.55' }],
        'lg': ['18px', { lineHeight: '1.35' }],
        'xl': ['22px', { lineHeight: '1.35' }],
        '2xl': ['28px', { lineHeight: '1.35' }],
        '3xl': ['36px', { lineHeight: '1.35' }],
        '4xl': ['48px', { lineHeight: '1.35' }],
      },
    },
  },
  plugins: [],
}
