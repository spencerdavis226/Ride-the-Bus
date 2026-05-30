import { chooseTheme, defaultSettings } from '../game/engine';
import type { GameState, Settings } from '../game/state';
import { isThemeId } from '../styles/themes';
import { makeInitialState } from './reducer';
import { ACTIVE_GAME_KEY, SETTINGS_KEY } from './storageKeys';
import { isResumableGameState } from './validateGameState';

export function normalizeLoadedGame(state: GameState): GameState {
  const settings = normalizeSettings(state.settings);
  return {
    ...state,
    settings,
    theme: chooseTheme(settings.themePreference),
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
    return raw ? normalizeSettings(JSON.parse(raw) as Partial<Settings>) : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function normalizeSettings(value: Partial<Settings> | unknown): Settings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaultSettings;
  const candidate = value as Partial<Settings>;
  const playerNames = Array.isArray(candidate.playerNames) && candidate.playerNames.every((name) => typeof name === 'string')
    ? candidate.playerNames
    : defaultSettings.playerNames;
  const busMode = candidate.busMode === 'endless' || candidate.busMode === 'singleDeck'
    ? candidate.busMode
    : defaultSettings.busMode;
  const themePreference = candidate.themePreference === 'random' || isThemeId(candidate.themePreference)
    ? candidate.themePreference
    : defaultSettings.themePreference;

  return {
    playerNames,
    busMode,
    themePreference
  };
}
