import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { Dispatch, ReactNode } from 'react';
import type { GameState } from '../game/state';
import { loadSavedGame, loadSettings, saveGame } from './persistence';
import { gameReducer, makeInitialState, type GameAction } from './reducer';

type GameContextValue = {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  hasSavedGame: boolean;
  savedGame: GameState | null;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const savedGame = useMemo(() => loadSavedGame(), []);
  const [state, dispatch] = useReducer(gameReducer, makeInitialState(loadSettings()));

  useEffect(() => {
    saveGame(state);
  }, [state]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      hasSavedGame: Boolean(savedGame && savedGame.phase !== 'setup'),
      savedGame: savedGame && savedGame.phase !== 'setup' ? savedGame : null
    }),
    [savedGame, state]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
