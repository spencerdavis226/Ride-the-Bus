import { describe, expect, it } from 'vitest';
import { applyDealGuess, continueDeal, startGame } from '../game/engine';

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

  it('holds the current player on screen after a deal guess until continue', () => {
    const state = startGame({
      playerNames: ['P1', 'P2'],
      busMode: 'singleDeck',
      animationSpeed: 'fast',
      themePreference: 'poker'
    });

    const afterGuess = applyDealGuess(state, 'red');
    expect(afterGuess.deal.playerIndex).toBe(0);
    expect(afterGuess.deal.awaitingContinue).toBe(true);
    expect(afterGuess.players[0].hand).toHaveLength(1);

    const afterContinue = continueDeal(afterGuess);
    expect(afterContinue.deal.playerIndex).toBe(1);
    expect(afterContinue.deal.awaitingContinue).toBe(false);
  });
});
