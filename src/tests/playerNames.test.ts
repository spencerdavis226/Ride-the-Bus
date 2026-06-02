import { describe, expect, it } from 'vitest';
import { startGame } from '../game/engine';
import {
  formatPlayerNameInput,
  getPlayerDisplayName,
  normalizeSetupPlayerNames,
  PLAYER_NAME_MAX_LENGTH
} from '../game/playerNames';

describe('player name formatting', () => {
  it('limits names to the UI character budget', () => {
    const formattedName = formatPlayerNameInput('alexanderthegreat');

    expect(formattedName).toBe('Alexanderthe');
    expect(formattedName).toHaveLength(PLAYER_NAME_MAX_LENGTH);
  });

  it('capitalizes the first entered letter by default', () => {
    expect(formatPlayerNameInput('alex')).toBe('Alex');
    expect(formatPlayerNameInput('  sam')).toBe('Sam');
  });

  it('uses numbered fallback names for blank entries', () => {
    expect(getPlayerDisplayName('', 0)).toBe('Player 1');
  });

  it('keeps at least one setup player row', () => {
    expect(normalizeSetupPlayerNames([])).toEqual(['']);
  });

  it('applies the same name rules when starting a game directly', () => {
    const state = startGame({
      playerNames: ['alexanderthegreat', 'sam'],
      busMode: 'singleDeck',
      themePreference: 'poker'
    });

    expect(state.settings.playerNames).toEqual(['Alexanderthe', 'Sam']);
    expect(state.players.map((player) => player.name)).toEqual(['Alexanderthe', 'Sam']);
  });

  it('allows starting a single-player game directly', () => {
    const state = startGame({
      playerNames: ['alex'],
      busMode: 'singleDeck',
      themePreference: 'poker'
    });

    expect(state.settings.playerNames).toEqual(['Alex']);
    expect(state.players.map((player) => player.name)).toEqual(['Alex']);
  });
});
