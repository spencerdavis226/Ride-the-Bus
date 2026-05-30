export const PLAYER_NAME_MAX_LENGTH = 12;

export function formatPlayerNameInput(value: string): string {
  const singleLineName = value.replace(/[\r\n\t]+/g, ' ').trimStart();
  const limitedName = singleLineName.slice(0, PLAYER_NAME_MAX_LENGTH);

  return limitedName.replace(/^[a-z]/, (letter) => letter.toUpperCase());
}

export function normalizePlayerNames(names: string[]): string[] {
  return names.map(formatPlayerNameInput);
}

export function getPlayerDisplayName(name: string, index: number): string {
  return formatPlayerNameInput(name).trim() || `Player ${index + 1}`;
}
