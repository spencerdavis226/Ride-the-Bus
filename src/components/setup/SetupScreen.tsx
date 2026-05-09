import { Infinity, RotateCcw, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { useGame } from '../../app/GameProvider';
import { calculatePhaseOneTwoDecks } from '../../game/deck';
import type { BusMode } from '../../game/state';
import { Button } from '../common/Button';
import { PlayerEditor } from './PlayerEditor';

const DEFAULT_NAMES = ['', ''];

export function SetupScreen() {
  const { state, dispatch, hasSavedGame, savedGame } = useGame();
  const names = state.settings.playerNames;
  const deckCount = calculatePhaseOneTwoDecks(names.length);

  return (
    <section className="setup-screen flex h-full min-w-0 flex-col gap-3 overflow-hidden landscape-xs:grid landscape-xs:grid-cols-[minmax(0,1fr)_minmax(15rem,28vw)] landscape-xs:grid-rows-[minmax(0,1fr)_auto] landscape-xs:[grid-template-areas:'players_info'_'players_actions'] landscape-xs:gap-[0.6rem] desktop-xl:w-[min(100%,92rem)] desktop-xl:mx-auto desktop-xl:gap-4">
      <div className="setup-table flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.35rem] felt-gradient shadow-[inset_0_0_0_1px_rgba(245,217,155,0.10),inset_0_1px_0_rgba(245,217,155,0.08)] landscape-xs:[grid-area:players] landscape-xs:min-h-0 desktop-xl:rounded-[1.75rem]">
        <div className="setup-table-header shrink-0 border-b border-gold/10 px-4 py-3 landscape-xs:px-[0.85rem] landscape-xs:py-[0.75rem] desktop-xl:px-6 desktop-xl:py-[1.35rem]">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="setup-eyebrow text-[0.62rem] font-black uppercase tracking-[0.24em] text-gold/65 desktop-xl:text-[0.8rem]">
                Players
              </p>
              <div className="mt-1 flex items-end gap-3">
                <p className="setup-player-count text-[clamp(2.7rem,12vw,4.7rem)] font-black leading-[0.85] text-cream landscape-xs:text-[clamp(2.25rem,7vw,3.25rem)] desktop-xl:text-[clamp(4.6rem,4.8vw,7rem)]">
                  {names.length}
                </p>
                <p className="setup-player-count-label pb-1 text-sm font-bold leading-tight text-cream/54 landscape-xs:text-[0.78rem] landscape-xs:pb-[0.2rem] desktop-xl:text-[1.15rem] desktop-xl:pb-[0.45rem]">
                  riders at the table
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: 'SETUP_SET_PLAYERS', names: DEFAULT_NAMES })}
              className="setup-reset tap-target flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white/[0.07] px-3.5 text-sm font-bold text-cream/75 ring-1 ring-white/[0.08] transition-[transform,background-color] duration-100 active:scale-95 active:bg-white/[0.13] desktop-xl:min-h-[4rem] desktop-xl:rounded-[1.1rem] desktop-xl:px-5 desktop-xl:text-base"
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
        <div className="setup-editor min-h-0 flex-1 overflow-y-auto p-3.5 landscape-xs:p-[0.65rem] desktop-xl:p-[1.1rem]">
          <PlayerEditor
            names={names}
            onChange={(nextNames) => dispatch({ type: 'SETUP_SET_PLAYERS', names: nextNames })}
          />
        </div>
      </div>

      <div className="setup-summary grid shrink-0 grid-cols-[auto_1fr] items-center gap-3 rounded-2xl border border-gold/15 bg-black/[0.22] px-4 py-3 text-sm landscape-xs:[grid-area:info] landscape-xs:self-start landscape-xs:p-[0.85rem] landscape-xs:rounded-[1rem] desktop-xl:w-[min(100%,92rem)] desktop-xl:mx-auto desktop-xl:px-[1.35rem] desktop-xl:py-[1.1rem]">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/12 text-gold ring-1 ring-gold/18">
          <Sparkles size={18} />
        </div>
        <div className="min-w-0">
          <p className="setup-summary-title font-black text-cream/90 landscape-xs:text-[0.82rem] landscape-xs:leading-[1.35] desktop-xl:text-[1.05rem]">
            Using {deckCount} deck{deckCount === 1 ? '' : 's'} for this game.
          </p>
          <p className="setup-summary-copy mt-0.5 text-cream/55 landscape-xs:text-[0.82rem] landscape-xs:leading-[1.35] desktop-xl:text-[0.95rem]">
            Deal and The Table share this shoe. The Bus starts fresh.
          </p>
        </div>
      </div>

      <footer className="setup-footer shrink-0 grid gap-2 pb-1 landscape-xs:[grid-area:actions] landscape-xs:self-end landscape-xs:pb-0 desktop-xl:w-[min(100%,92rem)] desktop-xl:mx-auto">
        {hasSavedGame && (
          <Button
            variant="secondary"
            className="w-full shadow-none landscape-xs:min-h-[2.9rem] landscape-xs:rounded-[1rem] desktop-xl:min-h-[4.3rem] desktop-xl:text-[1.1rem]"
            onClick={() => savedGame && dispatch({ type: 'HYDRATE', state: savedGame })}
          >
            Resume Game
          </Button>
        )}
        <Button className="w-full text-base shadow-none setup-start-button landscape-xs:min-h-[2.9rem] landscape-xs:rounded-[1rem] desktop-xl:min-h-[4.3rem] desktop-xl:text-[1.1rem]" onClick={() => dispatch({ type: 'START_GAME' })}>
          Start Game
        </Button>
      </footer>
    </section>
  );
}

function BusModeSelector({ onChange, value }: { onChange: (mode: BusMode) => void; value: BusMode }) {
  return (
    <fieldset className="bus-mode-selector mt-3 landscape-xs:mt-2 desktop-xl:mt-[1.1rem]">
      <legend className="setup-eyebrow mb-2 text-[0.58rem] font-black uppercase tracking-[0.22em] text-gold/62 landscape-xs:mb-[0.35rem]">
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
      className={`deck-mode-button min-h-[4.5rem] rounded-2xl px-3 py-2 text-left ring-1 transition-[transform,background-color,box-shadow] duration-100 active:scale-[0.98] landscape-xs:min-h-[3.2rem] landscape-xs:rounded-[0.85rem] desktop-xl:min-h-[5.6rem] desktop-xl:rounded-[1.25rem] desktop-xl:px-[1.1rem] ${
        active
          ? 'bg-gold text-ink ring-gold shadow-glow-sm'
          : 'bg-white/[0.07] text-cream/72 ring-white/[0.08] active:bg-white/[0.12]'
      }`}
    >
      <span className="flex items-center gap-3 landscape-xs:gap-[0.55rem]">
        {icon}
        <span className="deck-mode-label min-w-0 flex-1 text-sm font-black leading-tight desktop-xl:text-[1.05rem]">{label}</span>
      </span>
    </button>
  );
}

function DeckIcon({ label }: { label: '1' | 'inf' }) {
  return (
    <span className="relative grid h-11 w-9 shrink-0 place-items-center rounded-md bg-card-face text-ink shadow-card ring-1 ring-black/10">
      <span className="absolute -right-1 -top-1 h-full w-full rounded-md border border-card-face/45" />
      {label === '1' ? (
        <span className="font-black leading-none">1</span>
      ) : (
        <Infinity size={22} strokeWidth={3} />
      )}
    </span>
  );
}
