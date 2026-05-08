import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 18px 40px rgba(0, 0, 0, 0.32)',
        glow: '0 0 32px rgba(245, 217, 155, 0.28)',
        'glow-sm': '0 0 18px rgba(245, 217, 155, 0.20)',
        panel: '0 8px 32px rgba(0, 0, 0, 0.42)',
        sheet: '0 -8px 40px rgba(0, 0, 0, 0.52)',
      },
      minHeight: {
        dvh: '100dvh'
      }
    }
  },
  plugins: []
} satisfies Config;
