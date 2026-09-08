import { createStandardDeck, drawMany, shuffleFisherYates } from './deck';
import { beginTable, determineBusRiders } from './engine';
import { makeLog } from './log';
import { formatPlayerNameInput } from './playerNames';
import { dealSubphases } from './phases';
import { cardNumericValue } from './rules';
import type { GameState, Player } from './state';

export function joinsNextMatch(state: GameState): boolean {
  return state.phase === 'busIntro' || state.phase === 'bus' || state.phase === 'gameOver';
}

/** Reserve future draws, not just the catch-up cards dealt immediately. */
export function decksNeededForJoin(state: GameState): number {
  if (joinsNextMatch(state) || state.phase === 'setup') return 0;
  const required = state.phase === 'deal'
    ? state.players.reduce((total, player) => total + 4 - player.hand.length, 4 + 11)
    : 4;
  return Math.max(0, Math.ceil((required - state.shoe.length) / 52));
}

function finishChange(state: GameState, text: string): GameState {
  return {
    ...state,
    settings: { ...state.settings, playerNames: [...state.players, ...state.queuedPlayers].map(player => player.name) },
    undo: null,
    updatedAt: Date.now(),
    log: [...state.log, makeLog(text, 'system', { title: text, result: 'neutral' })]
  };
}

export function addPlayer(state: GameState, name: string, rng: () => number = Math.random): GameState {
  const normalized = formatPlayerNameInput(name).trim();
  if (state.phase === 'setup' || !normalized) return state;
  const player: Player = { id: `player-${state.nextPlayerId}`, name: normalized, hand: [] };
  let next = { ...state, nextPlayerId: state.nextPlayerId + 1 };
  if (joinsNextMatch(state)) {
    return finishChange({ ...next, queuedPlayers: [...state.queuedPlayers, player] }, `${normalized} is ready for the next match.`);
  }

  const extraDecks = decksNeededForJoin(state);
  if (extraDecks) {
    const added = Array.from({ length: extraDecks }, (_, index) => createStandardDeck(state.phaseOneTwoDecks + index + 1)).flat();
    next = { ...next, shoe: shuffleFisherYates([...state.shoe, ...added], rng), phaseOneTwoDecks: state.phaseOneTwoDecks + extraDecks };
  }
  const count = state.phase === 'deal' ? dealSubphases.indexOf(state.deal.subphase) : 4;
  const drawn = drawMany(next.shoe, count);
  const revealedRanks = new Set(state.table.cards.filter(card => card.faceUp).map(card => cardNumericValue(card.card)));
  player.hand = state.phase === 'table'
    ? drawn.cards.filter(card => !revealedRanks.has(cardNumericValue(card)))
    : drawn.cards;
  const catchUp = state.phase === 'table'
    ? ` Dealt 4 cards; ${4 - player.hand.length} matched earlier reveals. No past awards.`
    : count ? ` Dealt ${count} catch-up card${count === 1 ? '' : 's'} without awards or penalties.` : '';
  const deckMessage = extraDecks ? ` Added ${extraDecks} deck${extraDecks === 1 ? '' : 's'} to the undrawn shoe.` : '';
  return finishChange({ ...next, shoe: drawn.deck, players: [...state.players, player] }, `${normalized} joined.${catchUp}${deckMessage}`);
}

export function removePlayer(state: GameState, playerId: string): GameState {
  if (state.phase === 'setup') return state;
  const queued = state.queuedPlayers.find(player => player.id === playerId);
  if (queued) {
    return finishChange({ ...state, queuedPlayers: state.queuedPlayers.filter(player => player.id !== playerId) }, `${queued.name} left the next match.`);
  }
  const departing = state.players.find(player => player.id === playerId);
  if (!departing || state.phase === 'gameOver') return state;
  const players = state.players.filter(player => player.id !== playerId);
  let next: GameState = { ...state, players };
  if (state.phase === 'bus' && state.bus) {
    const riders = state.bus.riders.filter(player => player.id !== playerId);
    next.bus = { ...state.bus, riders };
    if (!riders.length) {
      next = { ...next, phase: 'gameOver', gameOverReason: 'ridersLeft', bus: {
        ...next.bus,
        drinksEach: state.bus.drinksEach + (state.bus.awaitingContinue ? state.bus.lastAssignment?.units ?? 0 : 0),
        awaitingContinue: false, lastAssignment: null, lastResult: null
      } };
    }
  }
  if (!players.length) {
    next = { ...next, phase: 'gameOver', gameOverReason: 'noPlayers' };
  } else if (state.phase === 'deal') {
    const current = state.players[state.deal.playerIndex];
    if (current.id !== playerId) {
      next.deal = { ...state.deal, playerIndex: players.findIndex(player => player.id === current.id) };
    } else {
      // Earlier turns in a round have one more card. The first incomplete hand
      // in the earliest unfinished round is exactly the next eligible turn.
      const round = dealSubphases.findIndex((_, index) => players.some(player => player.hand.length <= index));
      next.deal = { ...state.deal, lastAssignment: null, lastResult: null, awaitingContinue: false };
      if (round === -1) next = beginTable(next);
      else next.deal = { ...next.deal, subphase: dealSubphases[round], playerIndex: players.findIndex(player => player.hand.length <= round) };
    }
  } else if (state.phase === 'busIntro' && !determineBusRiders(players).length) {
    next = { ...next, phase: 'gameOver', gameOverReason: 'emptyBus' };
  }
  return finishChange(next, `${departing.name} left the match.`);
}
