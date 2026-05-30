import { Infinity, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import { useGame } from '../../app/GameProvider';
import type { BusMode } from '../../game/state';
import { Button } from '../common/Button';
import { HomeScreenInstallPrompt } from './HomeScreenInstallPrompt';
import { PlayerEditor } from './PlayerEditor';

const DEFAULT_NAMES = ['', ''];

export function SetupScreen() {
  const { state, dispatch } = useGame();
  const names = state.settings.playerNames;

  return (
    <section className="setup-screen flex h-full min-w-0 flex-col gap-3 overflow-hidden">
      <div className="setup-table flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="setup-table-header shrink-0 px-4 py-3">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="setup-eyebrow text-[0.62rem] font-black uppercase tracking-[0.24em]">
                Players
              </p>
              <div className="mt-1 flex items-end gap-3">
                <p className="setup-player-count text-[clamp(2.7rem,12vw,4.7rem)] font-black leading-[0.85] text-[var(--rtb-text)]">
                  {names.length}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: 'SETUP_SET_PLAYERS', names: DEFAULT_NAMES })}
              className="setup-reset tap-target flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--rtb-surface-soft)] px-3.5 text-sm font-bold text-[var(--rtb-text)] opacity-90 ring-1 ring-[var(--rtb-border)] transition-[transform,background-color] duration-100 active:scale-95 active:bg-[var(--rtb-surface-strong)]"
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
        <div className="setup-editor min-h-0 flex-1 overflow-y-auto p-3.5">
          <PlayerEditor
            names={names}
            onChange={(nextNames) => dispatch({ type: 'SETUP_SET_PLAYERS', names: nextNames })}
          />
        </div>
      </div>

      <footer className="setup-footer shrink-0 grid gap-2 pb-1">
        <HomeScreenInstallPrompt />
        <Button className="w-full text-base shadow-none setup-start-button" onClick={() => dispatch({ type: 'START_GAME' })}>
          Start Game
        </Button>
      </footer>
    </section>
  );
}

function BusModeSelector({ onChange, value }: { onChange: (mode: BusMode) => void; value: BusMode }) {
  return (
    <fieldset className="bus-mode-selector mt-3">
      <legend className="setup-eyebrow mb-2 text-[0.58rem] font-black uppercase tracking-[0.22em]">
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
      aria-pressed={active}
      onClick={onClick}
      className={`deck-mode-button min-h-[4.5rem] rounded-2xl px-3 py-2 text-left ring-1 transition-[transform,background-color,box-shadow] duration-100 active:scale-[0.98] ${
        active
          ? 'bg-[var(--rtb-accent)] text-[var(--rtb-accent-text)] ring-[var(--rtb-accent)] shadow-glow-sm'
          : 'bg-[var(--rtb-surface-soft)] text-[var(--rtb-text)] ring-[var(--rtb-border)] active:bg-[var(--rtb-surface-strong)]'
      }`}
    >
      <span className="flex items-center gap-3">
        {icon}
        <span className="deck-mode-label min-w-0 flex-1 text-sm font-black leading-tight">{label}</span>
      </span>
    </button>
  );
}

function DeckIcon({ label }: { label: '1' | 'inf' }) {
  return (
    <span className="relative grid h-11 w-9 shrink-0 place-items-center rounded-md bg-[var(--rtb-card-front)] text-[var(--rtb-card-ink)] shadow-card ring-1 ring-black/10">
      <span className="absolute -right-1 -top-1 h-full w-full rounded-md border border-[var(--rtb-card-front)] opacity-45" />
      {label === '1' ? (
        <span className="font-black leading-none">1</span>
      ) : (
        <Infinity size={22} strokeWidth={3} />
      )}
    </span>
  );
}
