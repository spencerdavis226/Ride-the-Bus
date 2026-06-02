import {
  applyBusGuess,
  applyDealGuess,
  chooseTheme,
  continueBus,
  continueDeal,
  continueTable,
  createSetupState,
  defaultSettings,
  namesToPlayers,
  startBus,
  startGame
} from '../game/engine';
import { flipNextTableCard } from '../game/engine';
import { normalizeSetupPlayerNames } from '../game/playerNames';
import type { BusGuess } from '../game/rules';
import type { BusMode, GameState, Settings, ThemePreference, UndoSnapshot } from '../game/state';
import { clearSavedGame } from './persistence';

export type GameAction =
  | { type: 'HYDRATE'; state: GameState }
  | { type: 'SETUP_SET_PLAYERS'; names: string[] }
  | { type: 'SETUP_SET_BUS_MODE'; mode: BusMode }
  | { type: 'START_GAME' }
  | { type: 'DEAL_GUESS'; guess: BusGuess }
  | { type: 'DEAL_CONTINUE' }
  | { type: 'TABLE_FLIP_NEXT' }
  | { type: 'TABLE_CONTINUE' }
  | { type: 'BUS_START' }
  | { type: 'BUS_GUESS'; guess: BusGuess }
  | { type: 'BUS_CONTINUE' }
  | { type: 'UNDO_LAST_ACTION' }
  | { type: 'OPEN_NEW_GAME_FROM_EXISTING_PLAYERS' }
  | { type: 'QUIT_TO_SETUP' }
  | { type: 'SET_THEME'; theme: ThemePreference };

export function makeInitialState(settings: Settings = defaultSettings): GameState {
  return createSetupState(settings);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;
    case 'SETUP_SET_PLAYERS':
      return setupUpdate(state, {
        ...state.settings,
        playerNames: action.names
      });
    case 'SETUP_SET_BUS_MODE':
      return setupUpdate(state, {
        ...state.settings,
        busMode: action.mode
      });
    case 'SET_THEME':
      return {
        ...state,
        settings: {
          ...state.settings,
          themePreference: action.theme
        },
        theme: chooseTheme(action.theme),
        updatedAt: Date.now()
      };
    case 'START_GAME':
      return startGame(settingsFromPlayers(state));
    case 'DEAL_GUESS':
      return withUndo(state, applyDealGuess(state, action.guess));
    case 'DEAL_CONTINUE':
      return continueDeal(state);
    case 'TABLE_FLIP_NEXT':
      return withUndo(state, flipNextTableCard(state));
    case 'TABLE_CONTINUE':
      return continueTable(state);
    case 'BUS_START':
      return startBus(state);
    case 'BUS_GUESS':
      return withUndo(state, applyBusGuess(state, action.guess));
    case 'BUS_CONTINUE':
      return continueBus(state);
    case 'UNDO_LAST_ACTION':
      return state.undo ? { ...state.undo, undo: null } : state;
    case 'OPEN_NEW_GAME_FROM_EXISTING_PLAYERS':
      return createSetupState(settingsFromPlayers(state));
    case 'QUIT_TO_SETUP':
      clearSavedGame();
      return createSetupState(settingsFromPlayers(state));
    default:
      return state;
  }
}

function withUndo(previous: GameState, next: GameState): GameState {
  if (next === previous) return previous;
  const { undo: _undo, ...undo } = previous;
  return { ...next, undo };
}

function settingsFromPlayers(state: GameState): Settings {
  if (!state.players.length) return state.settings;
  return {
    ...state.settings,
    playerNames: normalizeSetupPlayerNames(state.players.map((player) => player.name))
  };
}

function setupUpdate(state: GameState, settings: Settings): GameState {
  const normalizedSettings = {
    ...settings,
    playerNames: normalizeSetupPlayerNames(settings.playerNames)
  };

  return {
    ...createSetupState(normalizedSettings),
    players: namesToPlayers(normalizedSettings.playerNames),
    settings: normalizedSettings,
    log: state.log,
    theme: chooseTheme(normalizedSettings.themePreference)
  };
}
