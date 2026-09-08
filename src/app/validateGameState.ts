import type { Card } from '../game/cards';
import { MIN_PLAYER_COUNT } from '../game/playerNames';
import { dealSubphases } from '../game/phases';
import type { BusState, DealState, GamePhase, GameState, Player, Settings, TableState } from '../game/state';
import { isThemeId } from '../styles/themes';

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
    busModes.has(value.busMode) &&
    (
      value.themePreference === undefined ||
      value.themePreference === 'random' ||
      isThemeId(value.themePreference)
    )
  );
}

export function isResumableGameState(value: unknown): value is GameState {
  if (!isRecord(value)) return false;
  if (typeof value.phase !== 'string' || !gamePhases.includes(value.phase as GamePhase)) return false;
  if (value.phase === 'setup') return false;
  if (!Array.isArray(value.players) || (value.players.length < MIN_PLAYER_COUNT && !(value.phase === 'gameOver' && value.gameOverReason === 'noPlayers')) || !value.players.every(isPlayer)) {
    return false;
  }
  const queued = value.queuedPlayers ?? [];
  if (!Array.isArray(queued) || !queued.every(isPlayer) || queued.some(player => player.hand.length !== 0)) return false;
  const allPlayers = [...value.players, ...queued] as Player[];
  if (new Set(allPlayers.map(player => player.id)).size !== allPlayers.length) return false;
  if (value.nextPlayerId !== undefined && (!Number.isSafeInteger(value.nextPlayerId) || (value.nextPlayerId as number) <= Math.max(0, ...allPlayers.map(player => Number(player.id.replace('player-', '')) || 0)))) return false;
  if (!isSettings(value.settings)) return false;
  if (!Array.isArray(value.shoe) || !value.shoe.every(isCard)) return false;
  if (!isDealState(value.deal)) return false;
  if (value.phase === 'deal' && (!Number.isInteger(value.deal.playerIndex) || value.deal.playerIndex < 0 || value.deal.playerIndex >= value.players.length)) return false;
  if (!isTableState(value.table)) return false;
  if (!Array.isArray(value.log)) return false;
  if (typeof value.phaseOneTwoDecks !== 'number') return false;

  if (value.bus !== null && value.bus !== undefined && !isBusState(value.bus)) return false;
  if (value.phase === 'bus' && !isBusState(value.bus)) return false;
  if (value.phase === 'bus' && isBusState(value.bus)) {
    const ids = value.bus.riders.map(player => player.id);
    const activeIds = new Set((value.players as Player[]).map(player => player.id));
    if (!ids.length || new Set(ids).size !== ids.length || ids.some(id => !activeIds.has(id))) return false;
  }
  if (value.gameOverReason === 'noPlayers' && (value.phase !== 'gameOver' || value.players.length !== 0)) return false;
  if (value.gameOverReason === 'ridersLeft' && (value.phase !== 'gameOver' || !isBusState(value.bus) || value.bus.riders.length !== 0)) return false;
  if (value.phase === 'busIntro' && value.bus !== null && !isBusState(value.bus)) return false;

  return true;
}
