import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' }, screens: { '2xl': '1200px' } },
    extend: {
      colors: {
        navy: '#0B1428',
        slate2: '#172B4D',
        brand: { DEFAULT: '#2563EB', dark: '#1D4ED8' },
        cyan2: '#22D3EE',
      },
      fontFamily: { sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'] },
      boxShadow: { card: '0 1px 2px rgb(11 20 40 / 0.06), 0 8px 24px -12px rgb(11 20 40 / 0.18)' },
    },
  },
  plugins: [],
} satisfies Config
