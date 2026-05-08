import { describe, expect, it } from 'vitest';
import { startGame } from '../game/engine';

describe('engine start', () => {
  it('starts deal with a calculated phase one/two shoe', () => {
    const state = startGame({
      playerNames: Array.from({ length: 11 }, (_, index) => `P${index + 1}`),
      busMode: 'singleDeck',
      animationSpeed: 'fast',
      themePreference: 'poker'
    });
    expect(state.phase).toBe('deal');
    expect(state.phaseOneTwoDecks).toBe(2);
    expect(state.shoe).toHaveLength(104);
  });
});
