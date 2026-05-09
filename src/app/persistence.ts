import { defaultSettings } from '../game/engine';
import type { GameState, Settings } from '../game/state';
import { ACTIVE_GAME_KEY, SETTINGS_KEY } from './storageKeys';

export function loadSavedGame(): GameState | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_GAME_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as GameState;
    return {
      ...state,
      deal: {
        ...state.deal,
        lastResult: state.deal.lastResult ?? null,
        awaitingContinue: Boolean(state.deal.awaitingContinue)
      }
    };
  } catch {
    return null;
  }
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
