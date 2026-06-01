import { Infinity } from 'lucide-react';
import type { ReactNode } from 'react';
import { useGame } from '../../app/GameProvider';
import type { BusMode } from '../../game/state';
import { Button } from '../common/Button';
import { HomeScreenInstallPrompt } from './HomeScreenInstallPrompt';
import { PlayerEditor } from './PlayerEditor';

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
              <p className="setup-player-count mt-1 text-[clamp(2.9rem,12vw,4.7rem)] font-black leading-[0.85] text-[var(--rtb-text)]">
                {names.length}
              </p>
            </div>
            <BusModeSelector
              value={state.settings.busMode}
              onChange={(mode) => dispatch({ type: 'SETUP_SET_BUS_MODE', mode })}
            />
          </div>
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
  const activeLabel = value === 'singleDeck' ? '1 deck' : 'Endless';

  return (
    <fieldset className="bus-mode-selector flex min-h-[3.5rem] w-48 min-w-0 shrink-0 items-center justify-between gap-2 rounded-2xl bg-[var(--rtb-surface-soft)] px-2.5 py-1.5 ring-1 ring-[var(--rtb-border)]">
      <legend className="sr-only">Final Bus</legend>
      <div className="min-w-0">
        <p className="setup-eyebrow whitespace-nowrap text-[0.5rem] font-black uppercase tracking-[0.14em] min-[380px]:text-[0.56rem] min-[380px]:tracking-[0.2em]">Final bus</p>
        <p className="mt-0.5 truncate text-sm font-black leading-tight text-[var(--rtb-text)]">{activeLabel}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <DeckModeButton
          ariaLabel="Single-deck bus, stops when deck empties"
          active={value === 'singleDeck'}
          icon={<DeckIcon label="1" />}
          onClick={() => onChange('singleDeck')}
          title="Single-deck bus: stops when deck empties"
        />
        <DeckModeButton
          ariaLabel="Endless bus, reshuffles when empty"
          active={value === 'endless'}
          icon={<DeckIcon label="inf" />}
          onClick={() => onChange('endless')}
          title="Endless bus: reshuffles when empty"
        />
      </div>
    </fieldset>
  );
}

function DeckModeButton({
  ariaLabel,
  active,
  icon,
  onClick,
  title,
}: {
  ariaLabel: string;
  active: boolean;
  icon: ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={active}
      onClick={onClick}
      title={title}
      className={`deck-mode-button grid h-11 w-11 place-items-center rounded-xl ring-1 transition-[transform,background-color,box-shadow] duration-100 active:scale-[0.96] ${
        active
          ? 'bg-[var(--rtb-accent)] text-[var(--rtb-accent-text)] ring-[var(--rtb-accent)] shadow-glow-sm'
          : 'bg-[var(--rtb-surface-soft)] text-[var(--rtb-text)] ring-[var(--rtb-border)] active:bg-[var(--rtb-surface-strong)]'
      }`}
    >
      {icon}
    </button>
  );
}

function DeckIcon({ label }: { label: '1' | 'inf' }) {
  return (
    <span className={`deck-mode-icon ${label === '1' ? 'deck-mode-icon-single' : 'deck-mode-icon-endless'}`} aria-hidden="true">
      {label === '1' ? (
        <span className="deck-mode-icon-face">
          <span className="text-sm font-black leading-none">1</span>
        </span>
      ) : (
        <>
          <span className="deck-mode-icon-stack" />
          <span className="deck-mode-icon-face">
            <Infinity size={18} strokeWidth={3} />
          </span>
        </>
      )}
    </span>
  );
}
