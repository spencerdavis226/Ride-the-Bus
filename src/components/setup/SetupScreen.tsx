import { Infinity, RotateCcw, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { useGame } from '../../app/GameProvider';
import { calculatePhaseOneTwoDecks } from '../../game/deck';
import type { BusMode } from '../../game/state';
import { Button } from '../common/Button';
import { PlayerEditor } from './PlayerEditor';

const DEFAULT_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];

export function SetupScreen() {
  const { state, dispatch, hasSavedGame, savedGame } = useGame();
  const names = state.settings.playerNames;
  const deckCount = calculatePhaseOneTwoDecks(names.length);

  return (
    <section className="flex h-full min-w-0 flex-col gap-3 overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.35rem] bg-[radial-gradient(ellipse_at_50%_28%,rgba(22,130,90,0.62)_0%,rgba(3,30,20,0.98)_68%)] shadow-[inset_0_0_0_1px_rgba(245,217,155,0.10),inset_0_1px_0_rgba(245,217,155,0.08)]">
        <div className="shrink-0 border-b border-[#f5d99b]/10 px-4 py-3">
          <div className="flex items-end justify-between gap-3">
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
            <button
              type="button"
              onClick={() => dispatch({ type: 'SETUP_SET_PLAYERS', names: DEFAULT_NAMES })}
              className="tap-target flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white/[0.07] px-3.5 text-sm font-bold text-[#fff7e6]/75 ring-1 ring-white/[0.08] transition-[transform,background-color] duration-100 active:scale-95 active:bg-white/[0.13]"
            >
              <RotateCcw size={17} />
              Reset
            </button>
          </div>
          <BusModeSelector
            value={state.settings.busMode}
            onChange={(mode) => dispatch({ type: 'SETUP_SET_BUS_MODE', mode })}
          />
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
    </section>
  );
}

function BusModeSelector({ onChange, value }: { onChange: (mode: BusMode) => void; value: BusMode }) {
  return (
    <fieldset className="mt-3">
      <legend className="mb-2 text-[0.58rem] font-black uppercase tracking-[0.22em] text-[#f5d99b]/62">
        Bus Deck
      </legend>
      <div className="grid grid-cols-2 gap-2">
        <DeckModeButton
          active={value === 'singleDeck'}
          icon={<DeckIcon label="1" />}
          label="Single Deck"
          onClick={() => onChange('singleDeck')}
        />
        <DeckModeButton
          active={value === 'endless'}
          icon={<DeckIcon label="inf" />}
          label="Endless"
          onClick={() => onChange('endless')}
        />
      </div>
    </fieldset>
  );
}

function DeckModeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[4.5rem] rounded-2xl px-3 py-2 text-left ring-1 transition-[transform,background-color,box-shadow] duration-100 active:scale-[0.98] ${
        active
          ? 'bg-[#f5d99b] text-[#142019] ring-[#f5d99b] shadow-glow-sm'
          : 'bg-white/[0.07] text-[#fff7e6]/72 ring-white/[0.08] active:bg-white/[0.12]'
      }`}
    >
      <span className="flex items-center gap-3">
        {icon}
        <span className="min-w-0 flex-1 text-sm font-black leading-tight">{label}</span>
      </span>
    </button>
  );
}

function DeckIcon({ label }: { label: '1' | 'inf' }) {
  return (
    <span className="relative grid h-11 w-9 shrink-0 place-items-center rounded-md bg-[#fbf2d9] text-[#142019] shadow-card ring-1 ring-black/10">
      <span className="absolute -right-1 -top-1 h-full w-full rounded-md border border-[#fbf2d9]/45" />
      {label === '1' ? (
        <span className="font-black leading-none">1</span>
      ) : (
        <Infinity size={22} strokeWidth={3} />
      )}
    </span>
  );
}
