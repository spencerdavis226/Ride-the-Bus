import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 18px 40px rgba(0, 0, 0, 0.32)',
        glow: '0 0 32px rgba(245, 217, 155, 0.28)'
      },
      minHeight: {
        dvh: '100dvh'
      }
    }
  },
  plugins: []
} satisfies Config;
