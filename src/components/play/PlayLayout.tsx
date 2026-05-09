import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, History, House } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { suitGlyphs, type Card, type Suit } from '../../game/cards';
import type { DealSubphase } from '../../game/phases';
import type { BusGuess } from '../../game/rules';
import type { Player } from '../../game/state';
import { springs } from '../../lib/motion';
import { PlayingCard } from '../cards/PlayingCard';
import { IconButton } from '../common/IconButton';

export function PlayScreen({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`deal-screen flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-felt-deep shadow-[inset_0_0_0_1px_rgba(245,217,155,0.10),inset_0_24px_80px_rgba(245,217,155,0.06)] ${className}`}>
      {children}
    </section>
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
    <div className="deal-nav relative flex shrink-0 items-center px-1 pb-0.5 pt-1.5 landscape-xs:min-h-[2rem] landscape-xs:pt-[0.125rem] landscape-xs:pb-0">
      <IconButton ghost label="Home" onClick={onHome} className="shrink-0">
        <House size={21} strokeWidth={2.25} />
      </IconButton>
      <p className="pointer-events-none absolute left-1/2 max-w-[48vw] -translate-x-1/2 truncate text-center text-[0.82rem] font-black uppercase tracking-[0.2em] text-gold-dim/72 landscape-xs:text-[0.68rem]">
        Ride the Bus
      </p>
      <div className="ml-auto flex shrink-0">
        {rightActions}
        <IconButton ghost label="Rules" onClick={onRules}>
          <BookOpen size={21} strokeWidth={2.25} />
        </IconButton>
        {showLog && onLog && (
          <IconButton ghost label="Game log" onClick={onLog}>
            <History size={21} strokeWidth={2.25} />
          </IconButton>
        )}
      </div>
    </div>
  );
}

export function PlayerTurnRail({
  activePlayerId,
  onPreviewPlayer,
  players,
}: {
  activePlayerId?: string | null;
  onPreviewPlayer: (playerId: string) => void;
  players: Player[];
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const playerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (!activePlayerId) return;
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
      className="turn-rail flex shrink-0 gap-2 overflow-x-auto px-4 pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden landscape-xs:gap-[0.45rem] landscape-xs:px-3 landscape-xs:pt-[0.125rem] landscape-xs:pb-[0.35rem]"
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
            className={`turn-tile min-w-[clamp(6.8rem,31vw,9.2rem)] shrink-0 rounded-xl px-3 py-2.5 text-center outline-none ring-1 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-gold landscape-xs:min-w-[clamp(5.8rem,17vw,8rem)] landscape-xs:px-[0.65rem] landscape-xs:py-[0.38rem] landscape-xs:rounded-[0.85rem] ${
              active
                ? 'bg-gold text-ink ring-gold shadow-glow-sm'
                : 'bg-black/28 text-cream/58 ring-white/[0.07]'
            }`}
          >
            <div className="turn-tile-name truncate text-[0.86rem] font-black leading-snug landscape-xs:text-[0.72rem]">{candidate.name}</div>
            <MiniHand cards={candidate.hand} active={active} />
          </button>
        );
      })}
    </div>
  );
}

export function PlayFelt({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`deal-table mx-2 mb-0 mt-1 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.35rem] felt-gradient shadow-[inset_0_0_0_1px_rgba(245,217,155,0.09),inset_0_1px_0_rgba(245,217,155,0.08)] landscape-xs:mx-[0.5rem] landscape-xs:mt-[0.15rem] landscape-xs:rounded-[1rem] ${className}`}>
      {children}
    </div>
  );
}

export function PlayActionZone({ children }: { children: ReactNode }) {
  return <div className="deal-action-zone shrink-0 px-2 pb-3 pt-2 landscape-xs:px-4 landscape-xs:pt-[0.65rem] landscape-xs:pb-[0.75rem]">{children}</div>;
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
          className={`min-h-[58px] rounded-2xl px-2 text-[clamp(1rem,4.5vw,1.2rem)] font-black outline-none transition-transform duration-100 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-gold landscape-xs:min-h-[3.25rem] landscape-xs:text-[clamp(0.95rem,2.5vw,1.15rem)] landscape-xs:px-[0.6rem] landscape-xs:py-[0.45rem] ${guessToneClasses[option.tone]}`}
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
  dark: 'bg-felt-raised text-gold shadow-[inset_0_1px_0_rgba(245,217,155,0.07)]',
  red:  'bg-red-deep text-white ring-1 ring-red-900/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)]',
  gold: 'bg-gold text-ink ring-1 ring-gold-ring/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.40)]',
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
        className="w-full max-w-[27rem] rounded-2xl bg-felt-panel p-4 text-left shadow-[0_28px_80px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(245,217,155,0.16)]"
        onClick={(event) => event.stopPropagation()}
        initial={{ scale: 0.82, y: -8, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.86, y: -8, opacity: 0 }}
        transition={springs.overlay}
      >
        <div className="truncate pb-3 text-center text-[clamp(1.3rem,5vw,1.8rem)] font-black leading-tight text-cream">
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
      className={`mini-card flex h-[2rem] w-[1.35rem] flex-col items-center justify-center rounded-[4px] border text-[0.66rem] font-black leading-[0.9] shadow-sm bg-card-face landscape-xs:h-[1.45rem] landscape-xs:w-[1rem] landscape-xs:text-[0.5rem] landscape-xs:rounded-[0.22rem] ${
        active ? 'border-ink/18' : 'border-black/18'
      } ${red ? 'text-red-suit' : 'text-card-text'}`}
      title={`${card.rank} ${card.suit}`}
    >
      <span>{card.rank}</span>
      <span className="mini-card-suit text-[0.74rem] landscape-xs:text-[0.56rem]">{suitGlyphs[card.suit]}</span>
    </span>
  );
}
