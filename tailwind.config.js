// Colours and fonts come from src/theme.ts via CSS variables (see applyTheme).
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: v('page'), card: v('card'), sunk: v('sunk'),
        ink: v('ink'), muted: v('muted'), line: v('line'),
        accent: v('accent'), brand: v('brand'),
        up: v('up'), down: v('down'), upText: v('up-text'),
        live: v('live'), warn: v('warn'), warnBg: v('warn-bg'),
      },
      fontFamily: { sans: ['var(--font-sans)'] },
      borderRadius: { s: '8px', m: '12px', l: '20px' },
      boxShadow: { raised: '0 1px 0 rgb(22 20 15 / 0.04), 0 8px 24px -12px rgb(22 20 15 / 0.18)' },
      screens: { xs: '420px' },
    },
  },
  plugins: [],
}
