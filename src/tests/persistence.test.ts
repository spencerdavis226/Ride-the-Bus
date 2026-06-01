import { beforeEach, describe, expect, it, vi } from 'vitest';
import { startGame } from '../game/engine';
import { gameReducer } from '../app/reducer';
import {
  clearSavedGame,
  loadSavedGame,
  resolveInitialGameState,
  saveGame
} from '../app/persistence';
import { ACTIVE_GAME_KEY, SETTINGS_KEY } from '../app/storageKeys';
import { isResumableGameState } from '../app/validateGameState';

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    }
  });
});

describe('persistence', () => {
  it('round-trips a resumable mid-deal game', () => {
    const state = startGame({
      playerNames: ['Alex', 'Sam'],
      busMode: 'singleDeck',
      themePreference: 'poker'
    });
    saveGame(state);
    const loaded = loadSavedGame();
    expect(loaded?.phase).toBe('deal');
    expect(loaded?.players).toHaveLength(2);
    expect(isResumableGameState(loaded)).toBe(true);
  });

  it('auto-resolves initial state from an in-progress save', () => {
    const state = startGame({
      playerNames: ['Alex', 'Sam'],
      busMode: 'singleDeck',
      themePreference: 'poker'
    });
    saveGame(state);
    const initial = resolveInitialGameState();
    expect(initial.phase).toBe('deal');
    expect(initial.players[0]?.name).toBe('Alex');
  });

  it('does not treat setup saves as resumable', () => {
    const setup = resolveInitialGameState();
    saveGame(setup);
    expect(loadSavedGame()).toBeNull();
    expect(resolveInitialGameState().phase).toBe('setup');
  });

  it('clears corrupt saves', () => {
    storage.set(ACTIVE_GAME_KEY, '{not valid json');
    expect(loadSavedGame()).toBeNull();
    expect(storage.has(ACTIVE_GAME_KEY)).toBe(false);
  });

  it('clears invalid game shape saves', () => {
    storage.set(ACTIVE_GAME_KEY, JSON.stringify({ phase: 'deal', players: [] }));
    expect(loadSavedGame()).toBeNull();
    expect(storage.has(ACTIVE_GAME_KEY)).toBe(false);
  });

  it('clears active game after quit to setup', () => {
    const state = startGame({
      playerNames: ['Alex', 'Sam'],
      busMode: 'singleDeck',
      themePreference: 'poker'
    });
    saveGame(state);
    const afterQuit = gameReducer(state, { type: 'QUIT_TO_SETUP' });
    saveGame(afterQuit);
    expect(loadSavedGame()).toBeNull();
    expect(afterQuit.phase).toBe('setup');
  });

  it('updates theme immediately without clearing the active game', () => {
    const state = startGame({
      playerNames: ['Alex', 'Sam'],
      busMode: 'singleDeck',
      themePreference: 'poker'
    });
    const next = gameReducer(state, { type: 'SET_THEME', theme: 'spring' });

    expect(next.phase).toBe('deal');
    expect(next.players.map((player) => player.name)).toEqual(['Alex', 'Sam']);
    expect(next.log).toHaveLength(state.log.length);
    expect(next.settings.themePreference).toBe('spring');
    expect(next.theme).toBe('spring');
    expect(next.cardBackId).toBe(state.cardBackId);
  });

  it('defaults legacy settings without a theme preference to poker', () => {
    storage.set(SETTINGS_KEY, JSON.stringify({ playerNames: ['Alex', 'Sam'], busMode: 'endless' }));
    const initial = resolveInitialGameState();

    expect(initial.settings.themePreference).toBe('poker');
    expect(initial.theme).toBe('poker');
    expect(initial.settings.busMode).toBe('endless');
  });
});
