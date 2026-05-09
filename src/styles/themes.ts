import type { ThemeId } from '../game/state';

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  className: string;
  colors: [string, string, string];
  description: string;
};

export const themes: ThemeDefinition[] = [
  { id: 'poker', name: 'Ride the Bus', className: 'theme-poker', colors: ['#123f30', '#061812', '#f5d99b'], description: 'Emerald felt and soft brass' }
];

export function getThemeClass(_themeId: ThemeId): string {
  return 'theme-poker';
}
