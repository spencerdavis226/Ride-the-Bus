import { describe, expect, it } from 'vitest';
import { gameReducer } from '../app/reducer';
import { normalizeLoadedGame } from '../app/persistence';
import { isResumableGameState } from '../app/validateGameState';
import { createStandardDeck } from '../game/deck';
import { applyBusGuess, applyDealGuess, continueDeal, continueTable, defaultSettings, flipNextTableCard, startBus, startGame } from '../game/engine';
import { dealSubphases } from '../game/phases';
import { addPlayer, decksNeededForJoin, removePlayer } from '../game/roster';
import type { GameState } from '../game/state';

const rng = () => 0.5;
const guesses = ['red', 'higher', 'inside', 'spades'] as const;
const game = (count = 2) => startGame({ ...defaultSettings, playerNames: Array.from({ length: count }, (_, i) => `P${i + 1}`) }, rng);
function finishDeal(state: GameState): GameState {
  for (let guard = 0; state.phase === 'deal' && guard < 500; guard++) {
    state = state.deal.awaitingContinue ? continueDeal(state) : applyDealGuess(state, guesses[dealSubphases.indexOf(state.deal.subphase)], rng);
  }
  expect(state.phase).toBe('table');
  return state;
}
function busGame(): GameState {
  let state = finishDeal(game());
  // A valid completed table with remaining hands, deterministic rider tie.
  state = { ...state, table: { ...state.table, cards: state.table.cards.map(card => ({ ...card, faceUp: true })), activeIndex: 11, completed: true } };
  return startBus(continueTable(state), rng);
}

describe('mid-match joining', () => {
  for (let round = 0; round < 4; round++) for (const revealed of [false, true]) {
    it(`joins Deal round ${round + 1}, result visible: ${revealed}`, () => {
      let state = game();
      for (let i = 0; i < round * 2 + 1; i++) state = continueDeal(applyDealGuess(state, guesses[Math.floor(i / 2)], rng));
      if (revealed) state = applyDealGuess(state, guesses[round], rng);
      const next = addPlayer(state, 'New', rng);
      expect(next.deal).toEqual(state.deal);
      expect(next.players.slice(0, 2)).toEqual(state.players);
      expect(next.players[2].hand).toHaveLength(round);
      const table = finishDeal(next);
      expect(table.players.every(player => player.hand.length === 4)).toBe(true);
      expect(table.table.cards).toHaveLength(11);
    });
  }

  for (const flips of [0, 5, 11]) it(`catches up Table joins after ${flips} reveals without changing history`, () => {
    let state = finishDeal(game());
    for (let i = 0; i < flips; i++) state = flipNextTableCard(state);
    const next = addPlayer(state, 'New', rng);
    const ranks = new Set(state.table.cards.filter(card => card.faceUp).map(card => card.card.rank));
    expect(next.players[next.players.length - 1]?.hand).toEqual(state.shoe.slice(0, 4).filter(card => !ranks.has(card.rank)));
    expect(next.players.slice(0, 2)).toEqual(state.players);
    expect(next.table).toEqual(state.table);
    expect(next.log.slice(0, -1)).toEqual(state.log);
  });

  it('removes all catch-up cards, including duplicate ranks, without awards', () => {
    const state = finishDeal(game());
    const rank = state.table.cards[0].card.rank;
    state.table.cards[0].faceUp = true;
    state.table.activeIndex = 1;
    state.shoe = createStandardDeck(1).filter(card => card.rank === rank);
    const next = addPlayer(state, 'New', rng);
    expect(next.players[next.players.length - 1]?.hand).toHaveLength(0);
    expect(next.table.cards[0].matchedAssignments).toEqual([]);
  });

  it('adds a second deck at 11 players, shuffling only undrawn cards', () => {
    let state = game(10);
    state = continueDeal(applyDealGuess(state, 'red', rng));
    expect(decksNeededForJoin(state)).toBe(1);
    const next = addPlayer(state, 'Eleven', rng);
    expect(next.phaseOneTwoDecks).toBe(2);
    expect(next.players.slice(0, 10)).toEqual(state.players);
    const cards = [...next.shoe, ...next.players.flatMap(player => player.hand)];
    expect(cards).toHaveLength(104);
    expect(new Set(cards.map(card => card.id)).size).toBe(104);
  });

  it('uses exact available Table capacity and never returns departed cards', () => {
    const state = finishDeal(game(10));
    expect(state.shoe).toHaveLength(1);
    const joined = addPlayer(state, 'New', rng);
    expect(joined.phaseOneTwoDecks).toBe(2);
    expect(joined.table).toEqual(state.table);
    const left = removePlayer(joined, joined.players[joined.players.length - 1].id);
    expect(left.shoe).toEqual(joined.shoe);
    expect(left.phaseOneTwoDecks).toBe(2);
    let churn = left;
    const ids = new Set<string>();
    for (let i = 0; i < 30; i++) {
      churn = addPlayer(churn, 'Visitor', rng);
      const player = churn.players[churn.players.length - 1];
      expect(ids.has(player.id)).toBe(false);
      ids.add(player.id);
      churn = removePlayer(churn, player.id);
    }
    expect(churn.phaseOneTwoDecks).toBeGreaterThan(2);
    expect(new Set(churn.shoe.map(card => card.id)).size).toBe(churn.shoe.length);
    const exact = { ...state, shoe: createStandardDeck(2).slice(0, 4) };
    expect(decksNeededForJoin(exact)).toBe(0);
    expect(addPlayer(exact, 'Exact').shoe).toHaveLength(0);
  });
});

describe('departures and next match', () => {
  for (const index of [0, 1, 2]) for (const revealed of [false, true]) it(`removes position ${index} with current result ${revealed}`, () => {
    let state = continueDeal(applyDealGuess(game(3), 'red', rng));
    if (revealed) state = applyDealGuess(state, 'red', rng);
    const next = removePlayer(state, state.players[index].id);
    expect(next.players).toHaveLength(2);
    if (index !== 1) {
      expect(next.players[next.deal.playerIndex].id).toBe(state.players[1].id);
      expect(next.deal.lastResult).toEqual(state.deal.lastResult);
    } else expect(next.deal.awaitingContinue).toBe(false);
    expect(finishDeal(next).players.every(player => player.hand.length === 4)).toBe(true);
  });

  it('advances to Table when the final unfinished player leaves', () => {
    let state = game();
    for (let i = 0; i < 7; i++) state = continueDeal(applyDealGuess(state, guesses[Math.floor(i / 2)], rng));
    expect(removePlayer(state, state.players[1].id).phase).toBe('table');
  });

  it('ends with no players, remains resumable, and starts with a blank setup name', () => {
    const next = removePlayer(game(1), 'player-1');
    expect(next.gameOverReason).toBe('noPlayers');
    expect(isResumableGameState(next)).toBe(true);
    expect(gameReducer(next, { type: 'START_GAME' }).players).toHaveLength(1);
  });

  it('recalculates riders before Bus starts', () => {
    const bus = busGame();
    const intro: GameState = { ...bus, phase: 'busIntro', bus: null };
    intro.players[1] = { ...intro.players[1], hand: intro.players[1].hand.slice(0, 2) };
    const next = startBus(removePlayer(intro, intro.players[0].id), rng);
    expect(next.bus?.riders.map(player => player.id)).toEqual([intro.players[1].id]);
  });

  it('does not replace Bus riders or change the Bus deck; settles a revealed final penalty', () => {
    const bus = busGame();
    const guess = bus.bus!.visibleCards[0]!.color === 'red' ? 'black' : 'red';
    const failed = applyBusGuess(bus, guess, rng);
    const oneLeft = removePlayer(failed, failed.bus!.riders[0].id);
    expect(oneLeft.phase).toBe('bus');
    expect(oneLeft.bus?.deck).toEqual(failed.bus?.deck);
    expect(oneLeft.bus?.awaitingContinue).toBe(true);
    const done = removePlayer(oneLeft, oneLeft.bus!.riders[0].id);
    expect(done.phase).toBe('gameOver');
    expect(done.bus?.drinksEach).toBe(failed.bus!.drinksEach + failed.bus!.lastAssignment!.units);
  });

  it('ends when the only rider leaves but spectators remain', () => {
    const state = busGame();
    state.bus!.riders = [state.players[0]];
    const next = removePlayer(state, state.players[0].id);
    expect(next.gameOverReason).toBe('ridersLeft');
    expect(next.players).toHaveLength(1);
  });

  it('queues arrivals through Bus and game over; uses the queue on replay and setup', () => {
    for (const phase of ['busIntro', 'bus', 'gameOver'] as const) {
      const state = { ...busGame(), phase };
      const next = addPlayer(state, 'Later');
      expect(next.players).toEqual(state.players);
      expect(next.bus).toEqual(state.bus);
      expect(next.queuedPlayers[0].name).toBe('Later');
      for (const type of ['START_GAME', 'OPEN_NEW_GAME_FROM_EXISTING_PLAYERS'] as const) {
        expect(gameReducer(next, { type }).players.map(player => player.name)).toEqual(['P1', 'P2', 'Later']);
      }
      expect(removePlayer(next, next.queuedPlayers[0].id).queuedPlayers).toEqual([]);
      expect(normalizeLoadedGame(JSON.parse(JSON.stringify(next)))).toMatchObject({ queuedPlayers: next.queuedPlayers, nextPlayerId: next.nextPlayerId });
    }
  });

  it('clears undo on roster changes and ignores invalid mutations', () => {
    const state = gameReducer(game(), { type: 'DEAL_GUESS', guess: 'red' });
    expect(state.undo).not.toBeNull();
    expect(addPlayer(state, ' ').undo).toBe(state.undo);
    const next = gameReducer(state, { type: 'ADD_PLAYER', name: 'New' });
    expect(next.undo).toBeNull();
    expect(gameReducer(next, { type: 'UNDO_LAST_ACTION' })).toBe(next);
    expect(removePlayer(state, 'missing')).toBe(state);
    expect(removePlayer(state, 'player-2').undo).toBeNull();
  });

  it('preserves normalized gameplay undo across refresh', () => {
    const state = gameReducer(game(), { type: 'DEAL_GUESS', guess: 'red' });
    const loaded = normalizeLoadedGame(JSON.parse(JSON.stringify(state)));
    const undone = gameReducer(loaded, { type: 'UNDO_LAST_ACTION' });
    expect(undone.players[0].hand).toHaveLength(0);
    expect(undone.queuedPlayers).toEqual([]);
    expect(undone.nextPlayerId).toBe(3);
  });

  it('keeps queued arrivals when everyone leaves', () => {
    const state = addPlayer(busGame(), 'Later');
    const final = state.players.reduce((next, player) => removePlayer(next, player.id), state);
    expect(final.gameOverReason).toBe('noPlayers');
    expect(isResumableGameState(final)).toBe(true);
    expect(gameReducer(final, { type: 'START_GAME' }).players.map(player => player.name)).toEqual(['Later']);
  });

  it('normalizes legacy saves and rejects duplicate IDs and invalid turns', () => {
    const state = game();
    const { queuedPlayers: _queued, nextPlayerId: _id, ...legacy } = state;
    expect(isResumableGameState(legacy)).toBe(true);
    expect(normalizeLoadedGame(legacy as GameState).nextPlayerId).toBe(3);
    expect(normalizeLoadedGame(legacy as GameState).queuedPlayers).toEqual([]);
    expect(isResumableGameState({ ...state, queuedPlayers: [state.players[0]] })).toBe(false);
    expect(isResumableGameState({ ...state, nextPlayerId: 1 })).toBe(false);
    expect(isResumableGameState({ ...state, deal: { ...state.deal, playerIndex: 2 } })).toBe(false);
    expect(isResumableGameState({ ...state, players: [] })).toBe(false);
  });
});
