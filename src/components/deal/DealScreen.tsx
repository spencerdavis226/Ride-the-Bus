import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, History, House } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useGame } from '../../app/GameProvider';
import { suitGlyphs, type Card, type Suit } from '../../game/cards';
import type { DealSubphase } from '../../game/phases';
import type { BusGuess } from '../../game/rules';
import type { DealResult, DrinkAssignment, Player } from '../../game/state';
import { CardBack } from '../cards/CardBack';
import { PlayingCard } from '../cards/PlayingCard';
import { Button } from '../common/Button';
import { Drawer } from '../common/Drawer';
import { IconButton } from '../common/IconButton';
import { LogDrawer } from '../log/LogDrawer';

type GuessOption = {
  guess: BusGuess;
  label: string;
  icon?: string;
  tone: 'dark' | 'red' | 'gold';
};

export function DealScreen() {
  const { state, dispatch } = useGame();
  const [logOpen, setLogOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const [previewPlayerId, setPreviewPlayerId] = useState<string | null>(null);
  const player = state.players[state.deal.playerIndex];
  const previewPlayer = previewPlayerId ? state.players.find((candidate) => candidate.id === previewPlayerId) : null;
  const awaitingContinue = state.deal.awaitingContinue;
  const highlightedCardIndex = awaitingContinue ? player.hand.length - 1 : undefined;
  const options = getGuessOptions(state.deal.subphase);

  return (
    <section className="deal-screen flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[#042317] shadow-[inset_0_0_0_1px_rgba(245,217,155,0.10),inset_0_24px_80px_rgba(245,217,155,0.06)]">
      {/* Slim navigation bar */}
      <div className="deal-nav relative flex shrink-0 items-center px-1 pb-0.5 pt-1.5">
        <IconButton ghost label="Home" onClick={() => setQuitOpen(true)} className="shrink-0">
          <House size={21} strokeWidth={2.25} />
        </IconButton>
        <p className="pointer-events-none absolute left-1/2 max-w-[48vw] -translate-x-1/2 truncate text-center text-[0.82rem] font-black uppercase tracking-[0.2em] text-[#d8c79f]/72">
          Ride the Bus
        </p>
        <div className="ml-auto flex shrink-0">
          <IconButton ghost label="Rules" onClick={() => setRulesOpen(true)}>
            <BookOpen size={21} strokeWidth={2.25} />
          </IconButton>
          <IconButton ghost label="Game log" onClick={() => setLogOpen(true)}>
            <History size={21} strokeWidth={2.25} />
          </IconButton>
        </div>
      </div>

      {/* Player turn rail */}
      <TurnRail
        players={state.players}
        activePlayerId={player.id}
        onPreviewPlayer={(playerId) => setPreviewPlayerId(playerId)}
      />

      {/* Main game area - green felt */}
      <div className="deal-table mx-2 mb-0 mt-1.5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.35rem] bg-[radial-gradient(ellipse_at_50%_35%,rgba(22,130,90,0.80)_0%,rgba(3,30,20,0.97)_65%)] shadow-[inset_0_0_0_1px_rgba(245,217,155,0.09),inset_0_1px_0_rgba(245,217,155,0.08)]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${player.id}-${state.deal.subphase}`}
            className="deal-turn-content flex h-full min-h-0 flex-col gap-[clamp(0.5rem,2.4vh,1rem)] p-[clamp(0.9rem,3vw,1.5rem)]"
            initial={{ y: 18, scale: 0.985 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -14, scale: 0.985 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          >
            <div className="deal-hero shrink-0">
              <motion.h2
                className="deal-player-name max-w-full truncate pb-[0.08em] text-[clamp(3.1rem,14vw,7.5rem)] font-black leading-[0.95] tracking-tight text-[#fff7e6] sm:text-[clamp(4rem,10vw,8rem)]"
                initial={{ y: 10 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              >
                {player.name}
              </motion.h2>
              <AnimatePresence>
                {awaitingContinue && state.deal.lastAssignment && state.deal.lastResult && (
                  <DealOutcome
                    assignment={state.deal.lastAssignment}
                    result={state.deal.lastResult}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Center - four-card turn stage */}
            <div className="deal-stage min-h-0 flex-1">
              <ActiveHand cards={player.hand} highlightedIndex={highlightedCardIndex} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action zone */}
      <div className="deal-action-zone shrink-0 px-2 pb-3 pt-2">
        <AnimatePresence mode="wait">
          {awaitingContinue ? (
            <motion.div
              key="next-btn"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                className="w-full text-base"
                style={{ minHeight: '58px' }}
                onClick={() => dispatch({ type: 'DEAL_CONTINUE' })}
              >
                Next
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={`guess-btns-${player.id}-${state.deal.subphase}`}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 290 }}
            >
              <GuessPicker
                options={options}
                onGuess={(guess) => dispatch({ type: 'DEAL_GUESS', guess })}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LogDrawer open={logOpen} onClose={() => setLogOpen(false)} />
      <AnimatePresence>
        {previewPlayer && (
          <HandPreviewOverlay player={previewPlayer} onClose={() => setPreviewPlayerId(null)} />
        )}
      </AnimatePresence>
      <Drawer open={quitOpen} title="Go Home" onClose={() => setQuitOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm leading-6 text-[#fff7e6]/72">
            Return to setup and clear this run? Your player names and settings will stay ready for the next game.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setQuitOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => dispatch({ type: 'QUIT_TO_SETUP' })}>
              Go Home
            </Button>
          </div>
        </div>
      </Drawer>
      <Drawer open={rulesOpen} title="Rules" onClose={() => setRulesOpen(false)}>
        <div className="space-y-4 text-sm leading-6 text-[#fff7e6]/72">
          <p>Deal uses Red/Black, Higher/Lower/Same, Inside/Outside/Same, then Suit. Use Give and Take units.</p>
          <p>The Table flips eleven cards. Matching ranks from player hands autoplay and give the row value.</p>
          <p>The riders with the most cards left ride together. The Bus starts from a fresh single deck.</p>
          <p className="text-[#f5d99b]">Aces are high, except on September 1st.</p>
        </div>
      </Drawer>
    </section>
  );
}

function TurnRail({
  activePlayerId,
  onPreviewPlayer,
  players,
}: {
  activePlayerId: string;
  onPreviewPlayer: (playerId: string) => void;
  players: Player[];
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const playerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const rail = railRef.current;
    const activeTile = playerRefs.current[activePlayerId];
    if (!rail || !activeTile) return;

    const gutter = 16;
    const railLeft = rail.getBoundingClientRect().left;
    const tileLeft = activeTile.getBoundingClientRect().left;
    const tileRight = activeTile.getBoundingClientRect().right;
    const visibleLeft = railLeft + gutter;
    const visibleRight = railLeft + rail.clientWidth - gutter;
    let nextScrollLeft = rail.scrollLeft;

    if (tileLeft < visibleLeft) {
      nextScrollLeft -= visibleLeft - tileLeft;
    } else if (tileRight > visibleRight) {
      nextScrollLeft += tileRight - visibleRight;
    } else {
      return;
    }

    rail.scrollTo({
      left: Math.max(0, nextScrollLeft),
      behavior: 'smooth',
    });
  }, [activePlayerId]);

  return (
    <div
      ref={railRef}
      className="turn-rail flex shrink-0 gap-2 overflow-x-auto px-4 pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {players.map((candidate) => {
        const active = candidate.id === activePlayerId;
        return (
          <button
            key={candidate.id}
            ref={(node) => {
              playerRefs.current[candidate.id] = node;
            }}
            type="button"
            onClick={() => onPreviewPlayer(candidate.id)}
            className={`turn-tile min-w-[clamp(6.8rem,31vw,9.2rem)] shrink-0 rounded-xl px-3 py-2.5 text-center outline-none ring-1 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#f5d99b] ${
              active
                ? 'bg-[#f5d99b] text-[#142019] ring-[#f5d99b] shadow-glow-sm'
                : 'bg-black/28 text-[#fff7e6]/58 ring-white/[0.07]'
            }`}
          >
            <div className="turn-tile-name truncate text-[0.86rem] font-black leading-snug">{candidate.name}</div>
            <MiniHand cards={candidate.hand} active={active} />
          </button>
        );
      })}
    </div>
  );
}

function MiniHand({ active, cards }: { active: boolean; cards: Card[] }) {
  if (cards.length === 0) {
    return <div className="mt-1.5 h-[2rem]" />;
  }

  return (
    <div className="mt-1.5 flex justify-center gap-1">
      {cards.slice(0, 4).map((card) => (
        <MiniCard key={card.id} active={active} card={card} />
      ))}
    </div>
  );
}

function MiniCard({ active, card }: { active: boolean; card: Card }) {
  const red = card.color === 'red';
  return (
    <span
      className={`mini-card flex h-[2rem] w-[1.35rem] flex-col items-center justify-center rounded-[4px] border text-[0.66rem] font-black leading-[0.9] shadow-sm ${
        active ? 'border-[#142019]/18 bg-[#fbf2d9]' : 'border-black/18 bg-[#fbf2d9]'
      } ${red ? 'text-[#b72e35]' : 'text-[#111827]'}`}
      title={`${card.rank} ${card.suit}`}
    >
      <span>{card.rank}</span>
      <span className="mini-card-suit text-[0.74rem]">{suitGlyphs[card.suit]}</span>
    </span>
  );
}

function HandPreviewOverlay({ onClose, player }: { onClose: () => void; player: Player }) {
  return (
    <motion.button
      type="button"
      className="fixed inset-0 z-40 flex items-start justify-center bg-black/45 px-4 pt-[clamp(7rem,18vh,11rem)] outline-none backdrop-blur-[2px]"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
    >
      <motion.div
        className="w-full max-w-[27rem] rounded-2xl bg-[#08291d] p-4 text-left shadow-[0_28px_80px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(245,217,155,0.16)]"
        onClick={(event) => event.stopPropagation()}
        initial={{ scale: 0.82, y: -8, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.86, y: -8, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 330 }}
      >
        <div className="truncate pb-3 text-center text-[clamp(1.3rem,5vw,1.8rem)] font-black leading-tight text-[#fff7e6]">
          {player.name}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {player.hand.slice(0, 4).map((card) => (
            <div key={card.id} className="grid aspect-[5/7] min-h-0 place-items-center">
              <PlayingCard card={card} size="fluid" />
            </div>
          ))}
        </div>
      </motion.div>
    </motion.button>
  );
}

function DealOutcome({
  assignment,
  result,
}: {
  assignment: DrinkAssignment;
  result: DealResult;
}) {
  const correct = result.correct;
  const guessed = formatOutcomeValue(result.guess);
  const action = assignment.direction === 'give' ? 'Give' : 'Take';
  const shellClass = correct
    ? 'border-[#7fd8a3]/45 bg-[#123a2a] text-[#dff8e8] shadow-[0_12px_40px_rgba(47,160,99,0.18)]'
    : 'border-[#f0a0a8]/45 bg-[#481923] text-[#ffe5e8] shadow-[0_12px_40px_rgba(163,38,54,0.20)]';
  const statusClass = correct
    ? 'bg-[#7fd8a3] text-[#062015]'
    : 'bg-[#f0a0a8] text-[#2b080d]';
  const actionClass = assignment.direction === 'give'
    ? 'bg-[#dff8e8] text-[#123a2a]'
    : 'bg-[#ffe1a8] text-[#34210a]';

  return (
    <motion.div
      className={`mt-2 inline-flex max-w-full flex-wrap items-center gap-2 rounded-xl border px-3 py-2 ${shellClass}`}
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -4, opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <span className={`rounded-lg px-2.5 py-1 text-[0.72rem] font-black uppercase tracking-[0.08em] ${statusClass}`}>
        {correct ? 'Correct' : 'Wrong'}
      </span>
      <span className="text-[clamp(0.95rem,3.4vw,1.2rem)] font-black leading-tight">
        Guessed {guessed}
      </span>
      <span className={`rounded-lg px-2.5 py-1 text-[clamp(0.9rem,3vw,1.08rem)] font-black leading-tight ${actionClass}`}>
        {action} {assignment.units}
      </span>
    </motion.div>
  );
}

function formatOutcomeValue(value: string): string {
  if (value === 'spades' || value === 'hearts' || value === 'diamonds' || value === 'clubs') {
    return suitGlyphs[value];
  }
  return `${value[0]?.toUpperCase() ?? ''}${value.slice(1)}`;
}

function computeFan(containerW: number, containerH: number) {
  const N = 4;
  const ASPECT = 5 / 7; // card width / height
  const GAP = Math.max(8, Math.min(18, containerW * 0.02));
  const MAX_CARD_W = 340;
  const MIN_VISIBLE = 0.42; // min fraction visible on non-last cards when overlapping
  const TINY_OVERLAP = 0.88; // if step would be > this fraction of cardW, skip overlap

  let cardW = Math.min(containerH * ASPECT, MAX_CARD_W);

  // No overlap needed?
  if (N * cardW + (N - 1) * GAP <= containerW) {
    return { cardW, cardH: cardW / ASPECT, step: cardW + GAP };
  }

  const idealStep = (containerW - cardW) / (N - 1);

  // Overlap is tiny - shrink cards to fit cleanly without overlap instead
  if (idealStep >= cardW * TINY_OVERLAP) {
    cardW = (containerW - (N - 1) * GAP) / N;
    return { cardW, cardH: cardW / ASPECT, step: cardW + GAP };
  }

  // Real overlap - clamp to MIN_VISIBLE
  if (idealStep >= cardW * MIN_VISIBLE) {
    return { cardW, cardH: cardW / ASPECT, step: idealStep };
  }

  // Overlap too aggressive - shrink cards so MIN_VISIBLE fills the container
  cardW = containerW / (1 + MIN_VISIBLE * (N - 1));
  return { cardW, cardH: cardW / ASPECT, step: cardW * MIN_VISIBLE };
}

function ActiveHand({ cards, highlightedIndex }: { cards: Card[]; highlightedIndex?: number }) {
  const { state } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDims({ w: width, h: height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const fan = dims.w > 0 && dims.h > 0 ? computeFan(dims.w, dims.h) : null;
  const totalFanW = fan ? fan.cardW + fan.step * 3 : 0;

  return (
    <div
      ref={containerRef}
      className="flex h-full min-h-0 items-center justify-center overflow-visible px-[clamp(0.25rem,2vw,1.5rem)] py-[clamp(0.4rem,2vh,1rem)]"
    >
      {fan && (
        <div className="relative flex-shrink-0" style={{ width: totalFanW, height: fan.cardH }}>
          {Array.from({ length: 4 }, (_, i) => {
            const card = cards[i];
            const highlighted = highlightedIndex === i;
            return (
              <motion.div
                key={card?.id ?? `face-down-${i}`}
                className="absolute top-0"
                style={{ left: i * fan.step, width: fan.cardW, height: fan.cardH, zIndex: i + (highlighted ? 10 : 0) }}
                initial={{ y: 26 + i * 4, scale: 0.94, rotate: -1.5 + i * 0.7 }}
                animate={{ y: highlighted ? -Math.min(18, fan.cardH * 0.06) : 0, scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 300, delay: i * 0.045 }}
              >
                {card ? (
                  <PlayingCard card={card} size="fluid" highlighted={highlighted} />
                ) : (
                  <div className="h-full w-full rotate-180">
                    <CardBack id={state.cardBackId} size="fluid" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GuessPicker({
  className = '',
  onGuess,
  options,
}: {
  className?: string;
  onGuess: (guess: BusGuess) => void;
  options: GuessOption[];
}) {
  return (
    <div
      className={`deal-guess-picker grid gap-2 ${
        options.length === 2 ? 'grid-cols-2' : options.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
      } ${className}`}
    >
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => onGuess(option.guess)}
          className={`min-h-[58px] rounded-2xl px-2 text-[clamp(1rem,4.5vw,1.2rem)] font-black outline-none transition-transform duration-100 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#f5d99b] ${optionClasses[option.tone]}`}
        >
          {option.icon ? (
            <span className="flex flex-col items-center justify-center gap-0.5 leading-none">
              <span className="text-[clamp(1.7rem,7vw,2.25rem)] leading-none">{option.icon}</span>
              <span className="text-[clamp(0.68rem,2.7vw,0.82rem)] font-black uppercase tracking-[0.04em] opacity-80">
                {option.label}
              </span>
            </span>
          ) : (
            option.label
          )}
        </button>
      ))}
    </div>
  );
}

function getGuessOptions(subphase: DealSubphase): GuessOption[] {
  if (subphase === 'redBlack') {
    return [
      { guess: 'red', label: 'Red', tone: 'red' },
      { guess: 'black', label: 'Black', tone: 'dark' },
    ];
  }
  if (subphase === 'higherLowerSame') {
    return [
      { guess: 'higher', label: 'Higher', tone: 'dark' },
      { guess: 'lower', label: 'Lower', tone: 'dark' },
      { guess: 'same', label: 'Same', tone: 'dark' },
    ];
  }
  if (subphase === 'insideOutsideSame') {
    return [
      { guess: 'inside', label: 'Inside', tone: 'dark' },
      { guess: 'outside', label: 'Outside', tone: 'dark' },
      { guess: 'same', label: 'Same', tone: 'dark' },
    ];
  }
  const suits: Suit[] = ['spades', 'clubs', 'hearts', 'diamonds'];
  return suits.map((suit) => ({
    guess: suit,
    label: formatSuitName(suit),
    icon: suitGlyphs[suit],
    tone: suit === 'hearts' || suit === 'diamonds' ? 'red' : 'dark',
  }));
}

function formatSuitName(suit: Suit): string {
  return `${suit[0].toUpperCase()}${suit.slice(1)}`;
}

const optionClasses = {
  dark: 'bg-[#1a3428] text-[#f5d99b] shadow-[inset_0_1px_0_rgba(245,217,155,0.07)]',
  red: 'bg-[#9b1c22] text-white ring-1 ring-red-900/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)]',
  gold: 'bg-[#f5d99b] text-[#142019] ring-1 ring-[#c9a84c]/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.40)]',
};
