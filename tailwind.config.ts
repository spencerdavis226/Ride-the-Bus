import type { Config } from 'tailwindcss';
import { color, shadow } from './src/lib/tokens';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Felt surfaces
        'felt-base':    color.feltBase,
        'felt-deep':    color.feltDeep,
        'felt-surface': color.feltSurface,
        'felt-panel':   color.feltPanel,
        'felt-raised':  color.feltRaised,
        'felt-card':    color.feltCard,
        // Gold accent
        'gold':         color.gold,
        'gold-dim':     color.goldDim,
        'gold-ring':    color.goldRing,
        // Text
        'ink':          color.ink,
        'cream':        color.cream,
        // Card
        'card-face':    color.cardFace,
        'card-text':    color.cardText,
        // Red
        'red-suit':     color.red,
        'red-deep':     color.redDeep,
        // Feedback
        'correct-bg':     color.correctBg,
        'correct-text':   color.correctText,
        'correct-border': color.correctBorder,
        'wrong-bg':           color.wrongBg,
        'wrong-text':         color.wrongText,
        'wrong-border':       color.wrongBorder,
        'wrong-summary-bg':   color.wrongSummaryBg,
        'wrong-summary-text': color.wrongSummaryText,
        // Misc
        'history-red':  color.historyRed,
      },
      boxShadow: {
        card:           shadow.card,
        glow:           shadow.glow,
        'glow-sm':      shadow.glowSm,
        panel:          shadow.panel,
        sheet:          shadow.sheet,
        danger:         shadow.danger,
        'deal-correct': shadow.dealCorrect,
        'deal-wrong':   shadow.dealWrong,
      },
      screens: {
        // Landscape phone / small tablet — replaces the landscape !important block
        'landscape-xs': { raw: '(orientation: landscape) and (max-height: 500px) and (max-width: 950px)' },
        // Large desktop — replaces the desktop !important block
        'desktop-xl': { raw: '(min-width: 1600px) and (min-height: 900px)' },
      },
      minHeight: {
        dvh: '100dvh',
      },
    },
  },
  plugins: [],
} satisfies Config;
