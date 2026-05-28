import type { Card } from '../game/cards';
import { dealSubphases } from '../game/phases';
import type { BusState, DealState, GamePhase, GameState, Player, Settings, TableState } from '../game/state';

const gamePhases: GamePhase[] = ['setup', 'deal', 'table', 'busIntro', 'bus', 'gameOver'];
const busModes = new Set(['singleDeck', 'endless']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCard(value: unknown): value is Card {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.deckIndex === 'number' &&
    typeof value.suit === 'string' &&
    typeof value.color === 'string' &&
    typeof value.rank === 'string' &&
    typeof value.numericValue === 'number'
  );
}

function isPlayer(value: unknown): value is Player {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    Array.isArray(value.hand) &&
    value.hand.every(isCard)
  );
}

function isDealState(value: unknown): value is DealState {
  return (
    isRecord(value) &&
    typeof value.subphase === 'string' &&
    dealSubphases.includes(value.subphase as DealState['subphase']) &&
    typeof value.playerIndex === 'number' &&
    typeof value.awaitingContinue === 'boolean'
  );
}

function isTableState(value: unknown): value is TableState {
  return (
    isRecord(value) &&
    Array.isArray(value.cards) &&
    typeof value.activeIndex === 'number' &&
    typeof value.completed === 'boolean'
  );
}

function isBusState(value: unknown): value is BusState {
  return (
    isRecord(value) &&
    Array.isArray(value.riders) &&
    value.riders.every(isPlayer) &&
    Array.isArray(value.deck) &&
    value.deck.every(isCard) &&
    Array.isArray(value.visibleCards) &&
    typeof value.progressIndex === 'number' &&
    typeof value.drinksEach === 'number' &&
    typeof value.exhausted === 'boolean' &&
    typeof value.escaped === 'boolean' &&
    typeof value.awaitingContinue === 'boolean'
  );
}

function isSettings(value: unknown): value is Settings {
  return (
    isRecord(value) &&
    Array.isArray(value.playerNames) &&
    value.playerNames.every((name) => typeof name === 'string') &&
    typeof value.busMode === 'string' &&
    busModes.has(value.busMode)
  );
}

export function isResumableGameState(value: unknown): value is GameState {
  if (!isRecord(value)) return false;
  if (typeof value.phase !== 'string' || !gamePhases.includes(value.phase as GamePhase)) return false;
  if (value.phase === 'setup') return false;
  if (!Array.isArray(value.players) || value.players.length < 2 || !value.players.every(isPlayer)) {
    return false;
  }
  if (!isSettings(value.settings)) return false;
  if (!Array.isArray(value.shoe) || !value.shoe.every(isCard)) return false;
  if (!isDealState(value.deal)) return false;
  if (!isTableState(value.table)) return false;
  if (!Array.isArray(value.log)) return false;
  if (typeof value.phaseOneTwoDecks !== 'number') return false;

  if (value.phase === 'bus' && !isBusState(value.bus)) return false;
  if (value.phase === 'busIntro' && value.bus !== null && !isBusState(value.bus)) return false;

  return true;
}
