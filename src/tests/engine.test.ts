import { describe, expect, it } from 'vitest';
import type { Card } from '../game/cards';
import {
  applyBusGuess,
  applyDealGuess,
  busEscapesOnCorrectContinue,
  continueBus,
  continueDeal,
  flipNextTableCard,
  startGame
} from '../game/engine';
import type { GameState, Player, TableCard } from '../game/state';

const card = (id: string, color: Card['color'], rank: Card['rank'], numericValue: number, suit: Card['suit'] = 'spades'): Card => ({
  id,
  deckIndex: 1,
  suit,
  color,
  rank,
  numericValue
});

describe('engine start', () => {
  it('starts deal with a calculated phase one/two shoe', () => {
    const state = startGame({
      playerNames: Array.from({ length: 11 }, (_, index) => `P${index + 1}`),
      busMode: 'singleDeck',
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

  it('adds a structured deal history entry with assignments and fallback text', () => {
    const state = startGame({
      playerNames: ['Alex', 'Sam'],
      busMode: 'singleDeck',
      themePreference: 'poker'
    });

    const afterGuess = applyDealGuess({ ...state, shoe: [card('deal-card', 'black', '2', 2)] }, 'red');
    const entry = afterGuess.log[afterGuess.log.length - 1];

    expect(entry?.kind).toBe('deal');
    expect(entry?.text).toContain('Alex guessed Red');
    expect(entry?.assignments).toEqual([
      expect.objectContaining({
        playerId: 'player-1',
        playerName: 'Alex',
        direction: 'take',
        units: 1
      })
    ]);
    expect(entry?.title).toBe('Alex owes 1');
    expect(entry?.result).toBe('wrong');
  });

  it('adds a structured table history entry with all matched assignments', () => {
    const base = startGame({
      playerNames: ['Alex', 'Sam'],
      busMode: 'singleDeck',
      themePreference: 'poker'
    });
    const players: Player[] = [
      { id: 'player-1', name: 'Alex', hand: [card('a', 'black', '9', 9), card('b', 'red', '9', 9, 'hearts')] },
      { id: 'player-2', name: 'Sam', hand: [card('c', 'black', '9', 9)] }
    ];
    const tableCard: TableCard = {
      id: 'table-9',
      row: 3,
      value: 3,
      card: card('table-card', 'black', '9', 9),
      faceUp: false,
      matchedAssignments: []
    };
    const state: GameState = {
      ...base,
      phase: 'table',
      players,
      table: { cards: [tableCard], activeIndex: 0, completed: false },
      log: []
    };

    const afterFlip = flipNextTableCard(state);
    const entry = afterFlip.log[0];

    expect(entry.kind).toBe('table');
    expect(entry.text).toContain('Table 9 on Row 3');
    expect(entry.assignments).toHaveLength(3);
    expect(entry.assignments?.map((assignment) => assignment.label)).toEqual([
      'Alex: Give 3',
      'Alex: Give 3',
      'Sam: Give 3'
    ]);
    expect(entry.title).toBe('2 players give 9');
  });

  it('adds a structured bus history entry with rider debt', () => {
    const state = busState();
    const afterGuess = applyBusGuess(state, 'red');
    const entry = afterGuess.log[afterGuess.log.length - 1];

    expect(entry?.kind).toBe('bus');
    expect(entry?.text).toContain('Bus failed on card 1');
    expect(entry?.assignments).toEqual([
      expect.objectContaining({
        playerId: 'bus-riders',
        playerName: 'Riders',
        direction: 'take',
        units: 1
      })
    ]);
    expect(entry?.title).toBe('Riders owe 1 each');
    expect(entry?.result).toBe('wrong');
  });

  it('defers bus reset until continue after a wrong guess', () => {
    const state = busState();
    const afterGuess = applyBusGuess(state, 'red');

    expect(afterGuess.bus?.awaitingContinue).toBe(true);
    expect(afterGuess.bus?.progressIndex).toBe(0);
    expect(afterGuess.bus?.drinksEach).toBe(0);
    expect(afterGuess.bus?.visibleCards.map((next) => next?.id)).toEqual([
      'bus-1',
      'bus-2',
      'bus-3',
      'bus-4'
    ]);
    expect(afterGuess.bus?.lastResult?.correct).toBe(false);

    const afterContinue = continueBus(afterGuess);
    expect(afterContinue.bus?.awaitingContinue).toBe(false);
    expect(afterContinue.bus?.progressIndex).toBe(0);
    expect(afterContinue.bus?.drinksEach).toBe(1);
    expect(afterContinue.bus?.visibleCards.map((next) => next?.id)).toEqual([
      'next-1',
      'bus-2',
      'bus-3',
      'bus-4'
    ]);
  });

  it('ignores bus guesses while awaiting continue', () => {
    const afterGuess = applyBusGuess(busState(), 'red');
    const blocked = applyBusGuess(afterGuess, 'black');
    expect(blocked).toBe(afterGuess);
  });

  it('advances bus progress only after continue on a correct guess', () => {
    const state = busState();
    const afterGuess = applyBusGuess(state, 'black');

    expect(afterGuess.bus?.awaitingContinue).toBe(true);
    expect(afterGuess.bus?.progressIndex).toBe(0);
    expect(afterGuess.bus?.lastResult?.correct).toBe(true);

    const afterContinue = continueBus(afterGuess);
    expect(afterContinue.bus?.awaitingContinue).toBe(false);
    expect(afterContinue.bus?.progressIndex).toBe(1);
    expect(afterContinue.phase).toBe('bus');
  });

  it('escapes when Same is guessed correctly on card 2', () => {
    const state = busStateAt(1, [
      card('bus-1', 'black', '9', 9),
      card('bus-2', 'red', '9', 9, 'hearts'),
      card('bus-3', 'black', '4', 4),
      card('bus-4', 'red', '5', 5)
    ]);
    const afterContinue = continueBus(applyBusGuess(state, 'same'));

    expect(afterContinue.phase).toBe('gameOver');
    expect(afterContinue.gameOverReason).toBe('escaped');
    expect(afterContinue.bus?.escaped).toBe(true);
    expect(afterContinue.bus?.escapedViaSame).toBe(true);
    expect(afterContinue.bus?.progressIndex).toBe(4);
  });

  it('escapes when Same is guessed correctly on card 3', () => {
    const state = busStateAt(2, [
      card('bus-1', 'black', '5', 5),
      card('bus-2', 'red', '9', 9, 'hearts'),
      card('bus-3', 'black', '5', 5),
      card('bus-4', 'red', '7', 7)
    ]);
    const afterContinue = continueBus(applyBusGuess(state, 'same'));

    expect(afterContinue.phase).toBe('gameOver');
    expect(afterContinue.bus?.escapedViaSame).toBe(true);
  });

  it('does not escape on a wrong Same guess', () => {
    const state = busStateAt(1, [
      card('bus-1', 'black', '2', 2),
      card('bus-2', 'red', '3', 3, 'hearts'),
      card('bus-3', 'black', '4', 4),
      card('bus-4', 'red', '5', 5)
    ]);
    const afterContinue = continueBus(applyBusGuess(state, 'same'));

    expect(afterContinue.phase).toBe('bus');
    expect(afterContinue.bus?.escaped).toBe(false);
    expect(afterContinue.bus?.progressIndex).toBe(0);
  });

  it('advances without escaping on a correct non-Same guess', () => {
    const state = busStateAt(1, [
      card('bus-1', 'black', '2', 2),
      card('bus-2', 'red', '5', 5, 'hearts'),
      card('bus-3', 'black', '4', 4),
      card('bus-4', 'red', '7', 7)
    ]);
    const afterContinue = continueBus(applyBusGuess(state, 'higher'));

    expect(afterContinue.phase).toBe('bus');
    expect(afterContinue.bus?.escaped).toBe(false);
    expect(afterContinue.bus?.progressIndex).toBe(2);
  });

  it('escapes after four correct guesses without Same shortcut', () => {
    let state = busState();
    state = continueBus(applyBusGuess(state, 'black'));
    state = continueBus(applyBusGuess(state, 'higher'));
    state = continueBus(applyBusGuess(state, 'outside'));
    const afterEscape = continueBus(applyBusGuess(state, 'spades'));

    expect(afterEscape.phase).toBe('gameOver');
    expect(afterEscape.gameOverReason).toBe('escaped');
    expect(afterEscape.bus?.escapedViaSame).toBe(false);
  });

  it('detects bus escape paths from last result', () => {
    expect(busEscapesOnCorrectContinue(1, { guess: 'same', actual: 'same', correct: true })).toBe(true);
    expect(busEscapesOnCorrectContinue(1, { guess: 'higher', actual: 'higher', correct: true })).toBe(false);
    expect(busEscapesOnCorrectContinue(3, { guess: 'spades', actual: 'spades', correct: true })).toBe(true);
  });
});

function busStateAt(progressIndex: 0 | 1 | 2 | 3, visibleCards: Array<Card | null>): GameState {
  return {
    ...busState(),
    bus: {
      ...busState().bus!,
      progressIndex,
      visibleCards
    }
  };
}

function busState(): GameState {
  const base = startGame({
    playerNames: ['Alex', 'Sam'],
    busMode: 'singleDeck',
    themePreference: 'poker'
  });
  return {
    ...base,
    phase: 'bus',
    bus: {
      riders: base.players,
      deck: [card('next-1', 'red', '3', 3), card('next-2', 'black', '4', 4)],
      visibleCards: [
        card('bus-1', 'black', '2', 2),
        card('bus-2', 'red', '3', 3),
        card('bus-3', 'black', '4', 4),
        card('bus-4', 'red', '5', 5)
      ],
      progressIndex: 0,
      drinksEach: 0,
      exhausted: false,
      escaped: false,
      escapedViaSame: false,
      reshuffleCount: 0,
      lastAssignment: null,
      lastResult: null,
      awaitingContinue: false
    },
    log: []
  };
}
