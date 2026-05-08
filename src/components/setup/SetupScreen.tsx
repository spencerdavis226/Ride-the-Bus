import { RotateCcw, Settings } from 'lucide-react';
import { useState } from 'react';
import { useGame } from '../../app/GameProvider';
import { calculatePhaseOneTwoDecks } from '../../game/deck';
import { Button } from '../common/Button';
import { Drawer } from '../common/Drawer';
import { PlayerEditor } from './PlayerEditor';
import { SettingsPanel } from './SettingsPanel';

export function SetupScreen() {
  const { state, dispatch, hasSavedGame, savedGame } = useGame();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const names = state.settings.playerNames;
  const deckCount = calculatePhaseOneTwoDecks(names.length);
  const defaultNames = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];

  return (
    <section className="flex h-full min-w-0 flex-col gap-4 overflow-hidden">
      <div className="glass-panel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl p-4">
        <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
          <div>
            <p className="text-sm text-[#fff7e6]/70">Players</p>
            <p className="text-3xl font-bold">{names.length}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: 'SETUP_SET_PLAYERS', names: defaultNames })}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold text-[#fff7e6] ring-1 ring-white/10"
            >
              <RotateCcw size={18} /> Reset
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold text-[#f5d99b] ring-1 ring-white/10"
            >
              <Settings size={18} /> Settings
            </button>
          </div>
        </div>
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
          <PlayerEditor names={names} onChange={(nextNames) => dispatch({ type: 'SETUP_SET_PLAYERS', names: nextNames })} />
        </div>
      </div>
      <div className="shrink-0 rounded-xl border border-[#f5d99b]/20 bg-black/[0.18] p-4 text-sm text-[#fff7e6]/74">
        <p className="font-semibold text-[#fff7e6]">Using {deckCount} deck{deckCount === 1 ? '' : 's'} for this game.</p>
        <p className="mt-1">Deal and The Table share this shoe. The Bus always starts fresh.</p>
      </div>
      <footer className="shrink-0">
        <div className="grid gap-2">
          {hasSavedGame && (
            <Button variant="secondary" onClick={() => savedGame && dispatch({ type: 'HYDRATE', state: savedGame })}>
              Resume Game
            </Button>
          )}
          <Button onClick={() => dispatch({ type: 'START_GAME' })}>Start Game</Button>
        </div>
      </footer>
      <Drawer open={settingsOpen} title="Settings" onClose={() => setSettingsOpen(false)}>
        <SettingsPanel
          busMode={state.settings.busMode}
          animationSpeed={state.settings.animationSpeed}
          themePreference={state.settings.themePreference}
          onBusMode={(mode) => dispatch({ type: 'SETUP_SET_BUS_MODE', mode })}
          onAnimationSpeed={(speed) => dispatch({ type: 'SET_ANIMATION_SPEED', speed })}
          onTheme={(theme) => dispatch({ type: 'SET_THEME', theme })}
        />
      </Drawer>
    </section>
  );
}
