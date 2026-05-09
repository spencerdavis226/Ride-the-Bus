import { RotateCcw, Settings, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useGame } from '../../app/GameProvider';
import { calculatePhaseOneTwoDecks } from '../../game/deck';
import { CardBack } from '../cards/CardBack';
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
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.35rem] bg-[radial-gradient(ellipse_at_50%_28%,rgba(22,130,90,0.62)_0%,rgba(3,30,20,0.98)_68%)] shadow-[inset_0_0_0_1px_rgba(245,217,155,0.10),inset_0_1px_0_rgba(245,217,155,0.08)]">
        <div className="shrink-0 border-b border-[#f5d99b]/10 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-[#f5d99b]/65">
                Players
              </p>
              <div className="mt-1 flex items-end gap-3">
                <p className="text-[clamp(2.7rem,12vw,4.7rem)] font-black leading-[0.85] text-[#fff7e6]">
                  {names.length}
                </p>
                <p className="pb-1 text-sm font-bold leading-tight text-[#fff7e6]/54">
                  riders at the table
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-2xl bg-black/24 px-2.5 py-2 ring-1 ring-white/[0.08]">
              <CardBack id={state.cardBackId} size="compact" />
              <div className="hidden text-left leading-tight min-[390px]:block">
                <p className="text-[0.58rem] font-black uppercase tracking-[0.18em] text-[#f5d99b]/62">
                  Card back
                </p>
                <p className="mt-0.5 text-xs font-bold text-[#fff7e6]/64">
                  Randomized each game
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: 'SETUP_SET_PLAYERS', names: DEFAULT_NAMES })}
              className="tap-target flex items-center justify-center gap-2 rounded-xl bg-white/[0.07] px-3.5 text-sm font-bold text-[#fff7e6]/75 ring-1 ring-white/[0.08] transition-[transform,background-color] duration-100 active:scale-95 active:bg-white/[0.13]"
            >
              <RotateCcw size={17} />
              Reset
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="tap-target flex items-center justify-center gap-2 rounded-xl bg-[#f5d99b] px-3.5 text-sm font-black text-[#142019] shadow-glow-sm ring-1 ring-[#f5d99b]/70 transition-[transform,box-shadow] duration-100 active:scale-95 active:shadow-none"
            >
              <Settings size={17} />
              Settings
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3.5">
          <PlayerEditor
            names={names}
            onChange={(nextNames) => dispatch({ type: 'SETUP_SET_PLAYERS', names: nextNames })}
          />
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-[auto_1fr] items-center gap-3 rounded-2xl border border-[#f5d99b]/15 bg-black/[0.22] px-4 py-3 text-sm">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5d99b]/12 text-[#f5d99b] ring-1 ring-[#f5d99b]/18">
          <Sparkles size={18} />
        </div>
        <div className="min-w-0">
          <p className="font-black text-[#fff7e6]/90">
            Using {deckCount} deck{deckCount === 1 ? '' : 's'} for this game.
          </p>
          <p className="mt-0.5 text-[#fff7e6]/55">
            Deal and The Table share this shoe. The Bus starts fresh.
          </p>
        </div>
      </div>

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
          themePreference={state.settings.themePreference}
          onBusMode={(mode) => dispatch({ type: 'SETUP_SET_BUS_MODE', mode })}
          onTheme={(theme) => dispatch({ type: 'SET_THEME', theme })}
        />
      </Drawer>
    </section>
  );
}
