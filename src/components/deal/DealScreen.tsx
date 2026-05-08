import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, History, House } from 'lucide-react';
import { useState } from 'react';
import { useGame } from '../../app/GameProvider';
import { suitGlyphs, type Card, type Suit } from '../../game/cards';
import { dealSubphaseLabels, type DealSubphase } from '../../game/phases';
import type { BusGuess } from '../../game/rules';
import type { Player } from '../../game/state';
import { CardBack } from '../cards/CardBack';
import { PlayingCard } from '../cards/PlayingCard';
import { Button } from '../common/Button';
import { Drawer } from '../common/Drawer';
import { IconButton } from '../common/IconButton';
import { LogDrawer } from '../log/LogDrawer';

type GuessOption = {
  guess: BusGuess;
  label: string;
  tone: 'dark' | 'red' | 'gold';
};

export function DealScreen() {
  const { state, dispatch } = useGame();
  const [logOpen, setLogOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const player = state.players[state.deal.playerIndex];
  const awaitingContinue = state.deal.awaitingContinue;
  const latestCard = awaitingContinue ? player.hand[player.hand.length - 1] : null;
  const options = getGuessOptions(state.deal.subphase);

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[#042317] shadow-[inset_0_0_0_1px_rgba(245,217,155,0.10),inset_0_24px_80px_rgba(245,217,155,0.06)]">
      {/* Slim navigation bar */}
      <div className="flex shrink-0 items-center gap-2 px-3 pb-1 pt-2.5">
        <IconButton label="Home" onClick={() => setQuitOpen(true)} className="h-9 w-9 shrink-0">
          <House size={17} />
        </IconButton>
        <p className="flex-1 text-center text-[0.72rem] font-black uppercase tracking-[0.2em] text-[#f5d99b]/80">
          {dealSubphaseLabels[state.deal.subphase]}
        </p>
        <div className="flex shrink-0 gap-1.5">
          <IconButton label="Rules" onClick={() => setRulesOpen(true)} className="h-9 w-9">
            <BookOpen size={16} />
          </IconButton>
          <IconButton label="Game log" onClick={() => setLogOpen(true)} className="h-9 w-9">
            <History size={16} />
          </IconButton>
        </div>
      </div>

      {/* Player turn rail */}
      <TurnRail players={state.players} activePlayerId={player.id} />

      {/* Main game area — green felt */}
      <div className="mx-2 mb-0 mt-1.5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.35rem] bg-[radial-gradient(ellipse_at_50%_35%,rgba(22,130,90,0.80)_0%,rgba(3,30,20,0.97)_65%)] shadow-[inset_0_0_0_1px_rgba(245,217,155,0.09),inset_0_1px_0_rgba(245,217,155,0.08)]">
        <div className="flex h-full min-h-0 flex-col gap-3 p-4">
          {/* Player name + deck badge */}
          <div className="flex shrink-0 items-start justify-between gap-3">
            <h2 className="min-w-0 truncate text-[clamp(2.2rem,9vw,3.5rem)] font-black leading-[0.9] tracking-tight text-[#fff7e6]">
              {player.name}
            </h2>
            <div className="flex shrink-0 items-center gap-2 rounded-2xl bg-black/30 px-2 py-1.5 ring-1 ring-white/[0.09]">
              <CardBack id={state.cardBackId} size="compact" />
              <div className="text-center leading-none">
                <div className="text-xl font-black text-[#fff7e6]">{state.shoe.length}</div>
                <div className="mt-0.5 text-[8px] font-black uppercase tracking-[0.16em] text-[#fff7e6]/40">deck</div>
              </div>
            </div>
          </div>

          {/* Center — hand or flip result */}
          <div className="min-h-0 flex-1">
            <AnimatePresence mode="wait">
              {awaitingContinue ? (
                <motion.div
                  key="result"
                  className="flex h-full flex-col items-center justify-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {latestCard && (
                    <motion.div
                      initial={{ scale: 0.80, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                    >
                      <PlayingCard card={latestCard} size="hero" highlighted />
                    </motion.div>
                  )}
                  {state.deal.lastAssignment && (
                    <motion.div
                      className="w-full"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.18, duration: 0.22 }}
                    >
                      <div className="rounded-2xl bg-[#f5d99b] px-5 py-3 text-center shadow-glow">
                        <p className="text-[clamp(1.1rem,4.8vw,1.4rem)] font-black leading-tight text-[#142019]">
                          {state.deal.lastAssignment.label}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="hand"
                  className="h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <ActiveHand cards={player.hand} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom action zone */}
      <div className="shrink-0 px-2 pb-3 pt-2">
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
              key="guess-btns"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
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

function TurnRail({ activePlayerId, players }: { activePlayerId: string; players: Player[] }) {
  return (
    <div className="flex shrink-0 snap-x gap-2 overflow-x-auto px-2 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {players.map((candidate) => {
        const active = candidate.id === activePlayerId;
        return (
          <div
            key={candidate.id}
            className={`min-w-[clamp(5.5rem,26vw,7.5rem)] shrink-0 snap-start rounded-xl px-2.5 py-2 text-center ring-1 transition-colors duration-200 ${
              active
                ? 'bg-[#f5d99b] text-[#142019] ring-[#f5d99b] shadow-glow-sm'
                : 'bg-black/28 text-[#fff7e6]/58 ring-white/[0.07]'
            }`}
          >
            <div className="truncate text-[0.72rem] font-bold leading-snug">{candidate.name}</div>
            <MiniHand cards={candidate.hand} active={active} />
          </div>
        );
      })}
    </div>
  );
}

function MiniHand({ active, cards }: { active: boolean; cards: Card[] }) {
  return (
    <div className="mt-1 flex justify-center gap-[3px]">
      {Array.from({ length: 4 }, (_, index) => {
        const card = cards[index];
        return card ? (
          <MiniCard key={card.id} active={active} card={card} />
        ) : (
          <span
            key={index}
            className={`h-[1.1rem] w-[0.75rem] rounded-[3px] border ${
              active ? 'border-[#142019]/22' : 'border-white/[0.12]'
            }`}
          />
        );
      })}
    </div>
  );
}

function MiniCard({ active, card }: { active: boolean; card: Card }) {
  const red = card.color === 'red';
  return (
    <span
      className={`grid h-[1.1rem] w-[0.75rem] place-items-center rounded-[3px] border text-[0.52rem] font-black leading-none ${
        active ? 'border-[#142019]/18 bg-white/70' : 'border-black/18 bg-[#fbf2d9]'
      } ${red ? 'text-[#b72e35]' : 'text-[#111827]'}`}
      title={`${card.rank} ${card.suit}`}
    >
      {suitGlyphs[card.suit]}
    </span>
  );
}

function ActiveHand({ cards }: { cards: Card[] }) {
  return (
    <div className="flex h-full flex-col rounded-[1.1rem] bg-black/[0.18] p-3 ring-1 ring-white/[0.06]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#f5d99b]/60">
          Hand
        </span>
        <span className="rounded-full bg-black/30 px-2.5 py-0.5 text-[0.68rem] font-black text-[#fff7e6]/75">
          {cards.length}/4
        </span>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-4 items-center gap-2">
        {Array.from({ length: 4 }, (_, index) => {
          const card = cards[index];
          return (
            <div key={card?.id ?? `slot-${index}`} className="grid h-full min-h-0 w-full place-items-center">
              {card ? (
                <PlayingCard card={card} size="hand" />
              ) : (
                <div className="grid aspect-[5/7] h-full max-h-[8.5rem] w-auto max-w-full place-items-center rounded-lg border border-dashed border-[#f5d99b]/16 bg-white/[0.025] text-base font-black text-[#fff7e6]/18">
                  {index + 1}
                </div>
              )}
            </div>
          );
        })}
      </div>
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
      className={`grid gap-2 ${
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
          {option.label}
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
      { guess: 'same', label: 'Same', tone: 'gold' },
    ];
  }
  if (subphase === 'insideOutsideSame') {
    return [
      { guess: 'inside', label: 'Inside', tone: 'dark' },
      { guess: 'outside', label: 'Outside', tone: 'dark' },
      { guess: 'same', label: 'Same', tone: 'gold' },
    ];
  }
  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
  return suits.map((suit) => ({
    guess: suit,
    label: suitGlyphs[suit],
    tone: suit === 'hearts' || suit === 'diamonds' ? 'red' : 'dark',
  }));
}

const optionClasses = {
  dark: 'bg-[#1a3428] text-[#f5d99b] ring-1 ring-[#f5d99b]/18 shadow-[inset_0_1px_0_rgba(245,217,155,0.07)]',
  red: 'bg-[#9b1c22] text-white ring-1 ring-red-900/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)]',
  gold: 'bg-[#f5d99b] text-[#142019] ring-1 ring-[#c9a84c]/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.40)]',
};
