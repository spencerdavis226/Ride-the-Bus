import {
  applyBusGuess,
  applyDealGuess,
  continueDeal,
  createSetupState,
  defaultSettings,
  namesToPlayers,
  startBus,
  startGame
} from '../game/engine';
import { flipNextTableCard } from '../game/engine';
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
  | { type: 'BUS_START' }
  | { type: 'BUS_GUESS'; guess: BusGuess }
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
      return setupUpdate(state, {
        ...state.settings,
        themePreference: action.theme
      });
    case 'START_GAME':
      return startGame(state.settings);
    case 'DEAL_GUESS':
      return withUndo(state, applyDealGuess(state, action.guess));
    case 'DEAL_CONTINUE':
      return continueDeal(state);
    case 'TABLE_FLIP_NEXT':
      return withUndo(state, flipNextTableCard(state));
    case 'BUS_START':
      return startBus(state);
    case 'BUS_GUESS':
      return withUndo(state, applyBusGuess(state, action.guess));
    case 'UNDO_LAST_ACTION':
      return state.undo ? { ...state.undo, undo: null } : state;
    case 'OPEN_NEW_GAME_FROM_EXISTING_PLAYERS':
      return createSetupState({ ...state.settings, playerNames: state.settings.playerNames });
    case 'QUIT_TO_SETUP':
      clearSavedGame();
      return createSetupState(state.settings);
    default:
      return state;
  }
}

function withUndo(previous: GameState, next: GameState): GameState {
  if (next === previous) return previous;
  const { undo: _undo, ...undo } = previous;
  return { ...next, undo };
}

function setupUpdate(state: GameState, settings: Settings): GameState {
  return {
    ...createSetupState(settings),
    players: namesToPlayers(settings.playerNames),
    settings,
    log: state.log,
    theme: 'poker'
  };
}
