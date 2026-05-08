import type { ThemeId } from '../game/state';

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  className: string;
};

export const themes: ThemeDefinition[] = [
  { id: 'poker', name: 'Poker table', className: 'theme-poker' },
  { id: 'coffee', name: 'Coffee table', className: 'theme-coffee' },
  { id: 'picnic', name: 'Picnic table', className: 'theme-picnic' },
  { id: 'lounge', name: 'Dark lounge', className: 'theme-lounge' },
  { id: 'kitchen', name: 'Kitchen table', className: 'theme-kitchen' }
];

export function getThemeClass(themeId: ThemeId): string {
  return themes.find((theme) => theme.id === themeId)?.className ?? 'theme-poker';
}
