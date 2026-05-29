import { AnimatePresence, LayoutGroup, MotionConfig, motion, type Transition } from 'framer-motion';
import { BookOpen, History, House } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { suitGlyphs, type Card, type Suit } from '../../game/cards';
import type { DealSubphase } from '../../game/phases';
import type { BusGuess } from '../../game/rules';
import type { Player } from '../../game/state';
import { PlayingCard } from '../cards/PlayingCard';
import { IconButton } from '../common/IconButton';

export const playLayoutTransition: Transition = {
  type: 'spring',
  damping: 34,
  stiffness: 360,
  mass: 0.85,
};

export const playFadeTransition: Transition = {
  duration: 0.18,
  ease: 'easeOut',
};

export function PlayScreen({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <MotionConfig reducedMotion="user" transition={playLayoutTransition}>
      <LayoutGroup>
        <section className={`deal-screen flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[#042317] shadow-[inset_0_0_0_1px_rgba(245,217,155,0.10),inset_0_24px_80px_rgba(245,217,155,0.06)] ${className}`}>
          {children}
        </section>
      </LayoutGroup>
    </MotionConfig>
  );
}

export function PlayTopBar({
  onHome,
  onLog,
  onRules,
  rightActions,
  showLog = true,
}: {
  onHome: () => void;
  onLog?: () => void;
  onRules: () => void;
  rightActions?: ReactNode;
  showLog?: boolean;
}) {
  return (
    <div className="deal-nav relative flex shrink-0 items-center px-1 pb-0.5 pt-1.5">
      <div className="flex shrink-0">
        <IconButton ghost label="Home" onClick={onHome}>
          <House size={21} strokeWidth={2.25} />
        </IconButton>
        <IconButton ghost label="Rules" onClick={onRules}>
          <BookOpen size={21} strokeWidth={2.25} />
        </IconButton>
      </div>
      <p className="pointer-events-none absolute left-1/2 max-w-[48vw] -translate-x-1/2 truncate text-center text-[0.82rem] font-black uppercase tracking-[0.2em] text-[#d8c79f]/72">
        Ride the Bus
      </p>
      <div className="ml-auto flex shrink-0">
        {rightActions}
        {showLog && onLog && (
          <IconButton ghost label="History" onClick={onLog}>
            <History size={21} strokeWidth={2.25} />
          </IconButton>
        )}
      </div>
    </div>
  );
}

export function ResponsivePlayFrame({
  className = '',
  hero,
  result,
  stage,
}: {
  className?: string;
  hero: ReactNode;
  result?: ReactNode;
  stage: ReactNode;
}) {
  return (
    <motion.div layout className={`responsive-play-frame grid h-full min-h-0 min-w-0 gap-[clamp(0.65rem,2.4vh,1rem)] ${className}`}>
      <motion.div layout className="phase-hero-area min-h-0 min-w-0">{hero}</motion.div>
      <motion.div layout className="phase-stage-area min-h-0 min-w-0">{stage}</motion.div>
      <motion.div layout className="phase-result-area min-h-0 min-w-0">
        <AnimatePresence initial={false} mode="sync">
          {result && (
            <motion.div
              key="phase-result"
              layout
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={playFadeTransition}
            >
              {result}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export function PhaseHero({
  children,
  className = '',
  eyebrow,
  title,
  titleClassName = '',
}: {
  children?: ReactNode;
  className?: string;
  eyebrow: ReactNode;
  title: ReactNode;
  titleClassName?: string;
}) {
  return (
    <motion.div layout className={`phase-hero deal-hero shrink-0 ${className}`}>
      <p className="phase-eyebrow text-[0.62rem] font-black uppercase tracking-[0.24em] text-[#f5d99b]/65">
        {eyebrow}
      </p>
      <h2
        className={`phase-title deal-player-name max-w-full truncate pb-[0.02em] text-[clamp(3.1rem,14vw,7.5rem)] font-black leading-[1.05] tracking-normal text-[#fff7e6] sm:text-[clamp(4rem,10vw,8rem)] ${titleClassName}`}
      >
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

export function PlayTurnFrame({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      layout
      className={`deal-turn-content flex h-full min-h-0 flex-col overflow-hidden p-[clamp(0.9rem,3vw,1.5rem)] ${className}`}
      initial={{ y: 18, scale: 0.985 }}
      animate={{ y: 0, scale: 1 }}
      transition={playLayoutTransition}
    >
      {children}
    </motion.div>
  );
}

export function PlayTurnMain({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      layout
      className={`deal-turn-main mx-auto flex h-full w-full max-w-full min-w-0 flex-col gap-[clamp(0.5rem,2.4vh,1rem)] ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function PlayHero({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div layout className={`deal-hero shrink-0 ${className}`}>
      {children}
    </motion.div>
  );
}

export function PlayTitle({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`deal-player-name min-w-0 max-w-full truncate pb-[0.12em] text-[clamp(2.85rem,12vw,6.2rem)] font-black leading-[1.06] tracking-normal text-[#fff7e6] sm:text-[clamp(3.4rem,8vw,6.7rem)] ${className}`}>
      {children}
    </h2>
  );
}

export function PlayOutcomeSlot({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div layout className={`deal-outcome-slot ${className}`}>
      {children}
    </motion.div>
  );
}

export function PlayCardStage({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div layout className={`deal-stage grid min-h-0 flex-1 grid-cols-1 grid-rows-1 ${className}`}>
      {children}
    </motion.div>
  );
}

export function CardStage({
  children,
  className = '',
  count,
  gapMax = 18,
  gapMin = 8,
  maxCardHeight = 420,
}: {
  children: (metrics: { cardHeight: number; cardWidth: number; gap: number }) => ReactNode;
  className?: string;
  count: number;
  gapMax?: number;
  gapMin?: number;
  maxCardHeight?: number;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ height: 0, width: 0 });
  const safeCount = Math.max(1, count);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      const { height, width } = stage.getBoundingClientRect();
      if (height > 0 && width > 0) {
        setSize({ height, width });
      }
    };

    measure();
    const observer = new ResizeObserver(([entry]) => {
      const { height, width } = entry.contentRect;
      if (height > 0 && width > 0) {
        setSize({ height, width });
      }
    });
    observer.observe(stage);
    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('resize', measure);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      window.visualViewport?.removeEventListener('resize', measure);
      observer.disconnect();
    };
  }, []);

  const gap = Math.max(gapMin, Math.min(gapMax, size.width * 0.024));
  const availableWidth = Math.max(0, size.width - gap * (safeCount - 1));
  const cardWidth = Math.max(0, Math.min(availableWidth / safeCount, Math.min(size.height, maxCardHeight) * (5 / 7)));
  const cardHeight = cardWidth > 0 ? cardWidth / (5 / 7) : 0;

  return (
    <div ref={stageRef} className={`card-stage h-full min-h-0 min-w-0 ${className}`}>
      {cardWidth > 0 && cardHeight > 0 ? children({ cardHeight, cardWidth, gap }) : null}
    </div>
  );
}

export function PlayerTurnRail({
  activePlayerId,
  activePlayerIds,
  onPreviewPlayer,
  players,
}: {
  activePlayerId?: string | null;
  activePlayerIds?: string[];
  onPreviewPlayer: (playerId: string) => void;
  players: Player[];
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const playerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const highlightedIds = activePlayerIds ?? (activePlayerId ? [activePlayerId] : []);
  const scrollTargetId = highlightedIds[0];

  useEffect(() => {
    if (!scrollTargetId) return;
    const rail = railRef.current;
    const activeTile = playerRefs.current[scrollTargetId];
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
  }, [scrollTargetId]);

  return (
    <div
      ref={railRef}
      className="turn-rail flex shrink-0 gap-2 overflow-x-auto overflow-y-hidden px-4 pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {players.map((candidate) => {
        const active = highlightedIds.includes(candidate.id);
        return (
          <motion.button
            layout
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
            transition={playLayoutTransition}
          >
            <div className="turn-tile-name truncate text-[0.86rem] font-black leading-snug">{candidate.name}</div>
            <MiniHand cards={candidate.hand} active={active} />
          </motion.button>
        );
      })}
    </div>
  );
}

export function PlayFelt({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`deal-table mx-2 mb-0 mt-1 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.35rem] bg-[radial-gradient(ellipse_at_50%_35%,rgba(22,130,90,0.80)_0%,rgba(3,30,20,0.97)_65%)] shadow-[inset_0_0_0_1px_rgba(245,217,155,0.09),inset_0_1px_0_rgba(245,217,155,0.08)] ${className}`}>
      {children}
    </div>
  );
}

export function PlayActionZone({ children }: { children: ReactNode }) {
  return <motion.div layout className="deal-action-zone shrink-0 px-2 pb-3 pt-2">{children}</motion.div>;
}

export function PhaseActionBar({ children }: { children: ReactNode }) {
  return <PlayActionZone>{children}</PlayActionZone>;
}

export function PlayActionSwap({ actionKey, children }: { actionKey: string; children: ReactNode }) {
  return (
    <motion.div layout className="play-action-stack grid">
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={actionKey}
          layout
          className="play-action-panel col-start-1 row-start-1"
          initial={{ opacity: 0, y: 8, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.985 }}
          transition={playFadeTransition}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

type GuessOption = {
  guess: BusGuess;
  icon?: string;
  label: string;
  tone: 'dark' | 'red' | 'gold';
};

export function PlayGuessPicker({
  className = '',
  onGuess,
  subphase,
}: {
  className?: string;
  onGuess: (guess: BusGuess) => void;
  subphase: DealSubphase;
}) {
  const options = getGuessOptions(subphase);
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
          className={`min-h-[58px] rounded-2xl px-2 text-[clamp(1rem,4.5vw,1.2rem)] font-black outline-none transition-transform duration-100 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#f5d99b] ${guessToneClasses[option.tone]}`}
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
    icon: suitGlyphs[suit],
    label: formatSuitName(suit),
    tone: suit === 'hearts' || suit === 'diamonds' ? 'red' : 'dark',
  }));
}

function formatSuitName(suit: Suit): string {
  return `${suit[0].toUpperCase()}${suit.slice(1)}`;
}

const guessToneClasses = {
  dark: 'bg-[#1a3428] text-[#f5d99b] shadow-[inset_0_1px_0_rgba(245,217,155,0.07)]',
  red: 'bg-[#9b1c22] text-white ring-1 ring-red-900/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)]',
  gold: 'bg-[#f5d99b] text-[#142019] ring-1 ring-[#c9a84c]/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.40)]',
};

export function HandPreviewOverlay({ onClose, player }: { onClose: () => void; player: Player }) {
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

function MiniHand({ active, cards }: { active: boolean; cards: Card[] }) {
  if (cards.length === 0) {
    return <div className="mini-hand-empty mt-1.5 h-[2rem]" />;
  }

  return (
    <motion.div layout className="mini-hand mt-1.5 flex justify-center gap-1">
      <AnimatePresence initial={false}>
        {cards.slice(0, 4).map((card) => (
          <MiniCard key={card.id} active={active} card={card} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

function MiniCard({ active, card }: { active: boolean; card: Card }) {
  const red = card.color === 'red';
  return (
    <motion.span
      layout
      className={`mini-card flex h-[2rem] w-[1.35rem] flex-col items-center justify-center rounded-[4px] border text-[0.66rem] font-black leading-[0.9] shadow-sm ${
        active ? 'border-[#142019]/18 bg-[#fbf2d9]' : 'border-black/18 bg-[#fbf2d9]'
      } ${red ? 'text-[#b72e35]' : 'text-[#111827]'}`}
      initial={{ opacity: 0, scale: 0.82, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.82, y: -4 }}
      transition={playFadeTransition}
      title={`${card.rank} ${card.suit}`}
    >
      <span>{card.rank}</span>
      <span className="mini-card-suit text-[0.74rem]">{suitGlyphs[card.suit]}</span>
    </motion.span>
  );
}
