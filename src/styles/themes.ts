import type { ThemeId } from '../game/state';

export type ThemeIconName = 'Spade' | 'Orbit' | 'Moon' | 'Sun' | 'Waves' | 'Leaf' | 'Snowflake' | 'Sprout';

export type ThemeTokens = {
  appBg: string;
  feltBg: string;
  surface: string;
  surfaceStrong: string;
  text: string;
  textMuted: string;
  accent: string;
  accentText: string;
  border: string;
  danger: string;
  success: string;
  warning: string;
  correct: string;
  incorrect: string;
  cardFront: string;
  cardFront2: string;
  cardBorder: string;
  cardInk: string;
  cardRed: string;
  overlay: string;
  focus: string;
};

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  className: string;
  icon: ThemeIconName;
  colors: [string, string, string];
  description: string;
  tokens: ThemeTokens;
};

export const themeIds: ThemeId[] = ['poker', 'dark', 'blackout', 'light', 'summer', 'autumn', 'winter', 'spring'];

export const themes: ThemeDefinition[] = [
  {
    id: 'poker',
    name: 'Poker',
    className: 'theme-poker',
    icon: 'Spade',
    colors: ['#123f30', '#061812', '#f5d99b'],
    description: 'felt, brass, classic',
    tokens: {
      appBg: '#042317',
      feltBg: '#031e14',
      surface: '#0c2b20',
      surfaceStrong: '#143c2d',
      text: '#fff7e6',
      textMuted: '#d8c79f',
      accent: '#f5d99b',
      accentText: '#142019',
      border: 'rgba(255, 247, 230, 0.12)',
      danger: '#b72e35',
      success: '#8ee6a5',
      warning: '#ffdf8a',
      correct: '#f5d99b',
      incorrect: '#ff9f7a',
      cardFront: '#fbf2d9',
      cardFront2: '#efe1b9',
      cardBorder: 'rgba(37, 25, 12, 0.16)',
      cardInk: '#111827',
      cardRed: '#b72e35',
      overlay: 'rgba(0, 0, 0, 0.65)',
      focus: '#f5d99b',
    },
  },
  {
    id: 'dark',
    name: 'Nebula',
    className: 'theme-dark',
    icon: 'Orbit',
    colors: ['#0d1726', '#123b46', '#7dd3fc'],
    description: 'spacey, calm, clean',
    tokens: {
      appBg: '#08111f',
      feltBg: '#0c1d2b',
      surface: '#102234',
      surfaceStrong: '#17344a',
      text: '#eef7ff',
      textMuted: '#a8c6d8',
      accent: '#7dd3fc',
      accentText: '#06131d',
      border: 'rgba(238, 247, 255, 0.13)',
      danger: '#f87171',
      success: '#67e8b9',
      warning: '#fde68a',
      correct: '#7dd3fc',
      incorrect: '#f0abfc',
      cardFront: '#e8f4ff',
      cardFront2: '#b9d2ec',
      cardBorder: 'rgba(6, 19, 29, 0.18)',
      cardInk: '#081827',
      cardRed: '#b93656',
      overlay: 'rgba(1, 6, 14, 0.72)',
      focus: '#67e8f9',
    },
  },
  {
    id: 'blackout',
    name: 'Blackout',
    className: 'theme-blackout',
    icon: 'Moon',
    colors: ['#000000', '#111827', '#22d3ee'],
    description: 'OLED black, crisp',
    tokens: {
      appBg: '#000000',
      feltBg: '#020507',
      surface: '#0b0f14',
      surfaceStrong: '#141a22',
      text: '#f8fafc',
      textMuted: '#a8b3c4',
      accent: '#22d3ee',
      accentText: '#001017',
      border: 'rgba(248, 250, 252, 0.14)',
      danger: '#fb7185',
      success: '#5eead4',
      warning: '#facc15',
      correct: '#22d3ee',
      incorrect: '#facc15',
      cardFront: '#151a22',
      cardFront2: '#05070b',
      cardBorder: 'rgba(248, 250, 252, 0.18)',
      cardInk: '#f8fafc',
      cardRed: '#fb7185',
      overlay: 'rgba(0, 0, 0, 0.78)',
      focus: '#22d3ee',
    },
  },
  {
    id: 'light',
    name: 'Poolside',
    className: 'theme-light',
    icon: 'Sun',
    colors: ['#ffffff', '#dff7ff', '#0284c7'],
    description: 'bright, airy, clear',
    tokens: {
      appBg: '#f8fdff',
      feltBg: '#e6f8ff',
      surface: '#ffffff',
      surfaceStrong: '#dff4fb',
      text: '#102033',
      textMuted: '#52677c',
      accent: '#0284c7',
      accentText: '#ffffff',
      border: 'rgba(16, 32, 51, 0.13)',
      danger: '#be123c',
      success: '#047857',
      warning: '#b45309',
      correct: '#0284c7',
      incorrect: '#b45309',
      cardFront: '#ffffff',
      cardFront2: '#dff7ff',
      cardBorder: 'rgba(16, 32, 51, 0.14)',
      cardInk: '#102033',
      cardRed: '#be123c',
      overlay: 'rgba(10, 31, 48, 0.42)',
      focus: '#0369a1',
    },
  },
  {
    id: 'summer',
    name: 'Summer',
    className: 'theme-summer',
    icon: 'Waves',
    colors: ['#fffdf1', '#5eead4', '#f9735b'],
    description: 'sunny, fresh, easy',
    tokens: {
      appBg: '#fffdf1',
      feltBg: '#e7fbf4',
      surface: '#fff9e8',
      surfaceStrong: '#d7f8ec',
      text: '#17313a',
      textMuted: '#5c6f59',
      accent: '#0f766e',
      accentText: '#ffffff',
      border: 'rgba(23, 49, 58, 0.13)',
      danger: '#c2410c',
      success: '#15803d',
      warning: '#a16207',
      correct: '#0f766e',
      incorrect: '#f97316',
      cardFront: '#fffdf1',
      cardFront2: '#d7f8ec',
      cardBorder: 'rgba(23, 49, 58, 0.14)',
      cardInk: '#17313a',
      cardRed: '#c2410c',
      overlay: 'rgba(23, 49, 58, 0.40)',
      focus: '#0f766e',
    },
  },
  {
    id: 'autumn',
    name: 'Autumn',
    className: 'theme-autumn',
    icon: 'Leaf',
    colors: ['#24170d', '#7c2d12', '#f2b35d'],
    description: 'warm, grounded, mellow',
    tokens: {
      appBg: '#20150d',
      feltBg: '#2b1c10',
      surface: '#382414',
      surfaceStrong: '#4a2c17',
      text: '#fff3df',
      textMuted: '#d9b88f',
      accent: '#f2b35d',
      accentText: '#211207',
      border: 'rgba(255, 243, 223, 0.13)',
      danger: '#f9735b',
      success: '#a7d67a',
      warning: '#facc15',
      correct: '#f2b35d',
      incorrect: '#f9735b',
      cardFront: '#fff3df',
      cardFront2: '#f2d0a2',
      cardBorder: 'rgba(33, 18, 7, 0.18)',
      cardInk: '#2a1608',
      cardRed: '#c2410c',
      overlay: 'rgba(25, 13, 5, 0.70)',
      focus: '#f2b35d',
    },
  },
  {
    id: 'winter',
    name: 'Winter',
    className: 'theme-winter',
    icon: 'Snowflake',
    colors: ['#fbfdff', '#dbeafe', '#4f46e5'],
    description: 'frosted, bright, clear',
    tokens: {
      appBg: '#f4fbff',
      feltBg: '#dbeafe',
      surface: '#ffffff',
      surfaceStrong: '#e3eefb',
      text: '#1f3653',
      textMuted: '#64748b',
      accent: '#4f46e5',
      accentText: '#ffffff',
      border: 'rgba(31, 54, 82, 0.13)',
      danger: '#e11d48',
      success: '#047857',
      warning: '#b45309',
      correct: '#4f46e5',
      incorrect: '#0f766e',
      cardFront: '#fbfdff',
      cardFront2: '#dbeafe',
      cardBorder: 'rgba(31, 54, 82, 0.14)',
      cardInk: '#1f3653',
      cardRed: '#e11d48',
      overlay: 'rgba(31, 54, 82, 0.42)',
      focus: '#4f46e5',
    },
  },
  {
    id: 'spring',
    name: 'Spring',
    className: 'theme-spring',
    icon: 'Sprout',
    colors: ['#f8fff7', '#86efac', '#f9a8d4'],
    description: 'fresh, soft, lively',
    tokens: {
      appBg: '#f7fff6',
      feltBg: '#e9fbe9',
      surface: '#ffffff',
      surfaceStrong: '#dff7df',
      text: '#163323',
      textMuted: '#58725f',
      accent: '#15803d',
      accentText: '#ffffff',
      border: 'rgba(22, 51, 35, 0.13)',
      danger: '#be123c',
      success: '#047857',
      warning: '#a16207',
      correct: '#15803d',
      incorrect: '#db2777',
      cardFront: '#f8fff7',
      cardFront2: '#ffe4f1',
      cardBorder: 'rgba(22, 51, 35, 0.14)',
      cardInk: '#163323',
      cardRed: '#be123c',
      overlay: 'rgba(22, 51, 35, 0.40)',
      focus: '#15803d',
    },
  },
];

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && themeIds.includes(value as ThemeId);
}

export function getThemeClass(themeId: ThemeId | string | null | undefined): string {
  return themes.find((theme) => theme.id === themeId)?.className ?? 'theme-poker';
}

export function getThemeDefinition(themeId: ThemeId | string | null | undefined): ThemeDefinition {
  return themes.find((theme) => theme.id === themeId) ?? themes[0];
}
