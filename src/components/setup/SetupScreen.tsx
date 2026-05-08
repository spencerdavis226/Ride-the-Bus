import { RotateCcw, Settings } from 'lucide-react';
import { useState } from 'react';
import { useGame } from '../../app/GameProvider';
import { calculatePhaseOneTwoDecks } from '../../game/deck';
import { Button } from '../common/Button';
import { Drawer } from '../common/Drawer';
import { PlayerEditor } from './PlayerEditor';
import { SettingsPanel } from './SettingsPanel';

const DEFAULT_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];

export function SetupScreen() {
  const { state, dispatch, hasSavedGame, savedGame } = useGame();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const names = state.settings.playerNames;
  const deckCount = calculatePhaseOneTwoDecks(names.length);

  return (
    <section className="flex h-full min-w-0 flex-col gap-3 overflow-hidden">
      {/* Player list panel */}
      <div className="glass-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-4 py-3">
          <div>
            <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-[#f5d99b]/65">
              Players
            </p>
            <p className="text-2xl font-black leading-tight text-[#fff7e6]">{names.length}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: 'SETUP_SET_PLAYERS', names: DEFAULT_NAMES })}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-white/[0.09] px-3.5 text-sm font-semibold text-[#fff7e6]/80 ring-1 ring-white/[0.08] transition-[transform,background-color] duration-100 active:scale-95 active:bg-white/[0.15]"
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-white/[0.09] px-3.5 text-sm font-semibold text-[#f5d99b] ring-1 ring-white/[0.08] transition-[transform,background-color] duration-100 active:scale-95 active:bg-white/[0.15]"
            >
              <Settings size={14} />
              Settings
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <PlayerEditor
            names={names}
            onChange={(nextNames) => dispatch({ type: 'SETUP_SET_PLAYERS', names: nextNames })}
          />
        </div>
      </div>

      {/* Deck info */}
      <div className="shrink-0 rounded-2xl border border-[#f5d99b]/15 bg-black/[0.22] px-4 py-3 text-sm">
        <p className="font-bold text-[#fff7e6]/90">
          Using {deckCount} deck{deckCount === 1 ? '' : 's'} for this game.
        </p>
        <p className="mt-0.5 text-[#fff7e6]/55">
          Deal and The Table share this shoe. The Bus always starts fresh.
        </p>
      </div>

      {/* Action footer */}
      <footer className="shrink-0 grid gap-2 pb-1">
        {hasSavedGame && (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => savedGame && dispatch({ type: 'HYDRATE', state: savedGame })}
          >
            Resume Game
          </Button>
        )}
        <Button className="w-full text-base" onClick={() => dispatch({ type: 'START_GAME' })}>
          Start Game
        </Button>
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
