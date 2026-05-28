import { defaultSettings } from '../game/engine';
import type { GameState, Settings } from '../game/state';
import { makeInitialState } from './reducer';
import { ACTIVE_GAME_KEY, SETTINGS_KEY } from './storageKeys';
import { isResumableGameState } from './validateGameState';

export function normalizeLoadedGame(state: GameState): GameState {
  return {
    ...state,
    deal: {
      ...state.deal,
      lastResult: state.deal.lastResult ?? null,
      awaitingContinue: Boolean(state.deal.awaitingContinue)
    },
    bus: state.bus
      ? {
          ...state.bus,
          lastResult: state.bus.lastResult ?? null,
          awaitingContinue: Boolean(state.bus.awaitingContinue),
          escapedViaSame: Boolean(state.bus.escapedViaSame)
        }
      : null
  };
}

export function loadSavedGame(): GameState | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_GAME_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isResumableGameState(parsed)) {
      clearSavedGame();
      return null;
    }
    return normalizeLoadedGame(parsed);
  } catch {
    clearSavedGame();
    return null;
  }
}

export function resolveInitialGameState(): GameState {
  const settings = loadSettings();
  const saved = loadSavedGame();
  if (saved) return saved;
  return makeInitialState(settings);
}

export function saveGame(state: GameState): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(ACTIVE_GAME_KEY, JSON.stringify(state));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
}

export function clearSavedGame(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(ACTIVE_GAME_KEY);
}

export function loadSettings(): Settings {
  if (typeof localStorage === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings, ...(JSON.parse(raw) as Partial<Settings>) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}
