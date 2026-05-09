import type { ThemeId } from '../game/state';

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  className: string;
  colors: [string, string, string];
  description: string;
};

export const themes: ThemeDefinition[] = [
  { id: 'poker', name: 'Poker table', className: 'theme-poker', colors: ['#0d4a36', '#071812', '#f5d99b'], description: 'Classic green felt' },
  { id: 'coffee', name: 'Coffee table', className: 'theme-coffee', colors: ['#41291f', '#15110f', '#f5f2da'], description: 'Warm wood tones' },
  { id: 'picnic', name: 'Picnic table', className: 'theme-picnic', colors: ['#143d2b', '#872d32', '#f5d99b'], description: 'Casual red and green' },
  { id: 'lounge', name: 'Dark lounge', className: 'theme-lounge', colors: ['#171922', '#08090d', '#d2b45f'], description: 'Low light and brass' },
  { id: 'kitchen', name: 'Kitchen table', className: 'theme-kitchen', colors: ['#2c3d31', '#111a15', '#fff7e6'], description: 'Soft tiled green' },
  { id: 'velvet', name: 'Velvet room', className: 'theme-velvet', colors: ['#4a1226', '#12070c', '#f0c67a'], description: 'Deep red casino' },
  { id: 'ocean', name: 'Ocean club', className: 'theme-ocean', colors: ['#0b4a5b', '#061820', '#9ee7df'], description: 'Cool teal felt' },
  { id: 'copper', name: 'Copper bar', className: 'theme-copper', colors: ['#51311f', '#120d09', '#e7a766'], description: 'Burnished amber' },
  { id: 'midnight', name: 'Midnight blue', className: 'theme-midnight', colors: ['#172544', '#050812', '#b9cff7'], description: 'Blue-black table' },
  { id: 'garden', name: 'Garden party', className: 'theme-garden', colors: ['#315232', '#101a11', '#e7d58c'], description: 'Leafy and calm' }
];

export function getThemeClass(themeId: ThemeId): string {
  return themes.find((theme) => theme.id === themeId)?.className ?? 'theme-poker';
}
