import { BookOpen, History, House } from 'lucide-react';
import { useState } from 'react';
import { useGame } from '../../app/GameProvider';
import { suitGlyphs, type Card, type Suit } from '../../game/cards';
import { dealSubphaseLabels, type DealSubphase } from '../../game/phases';
import type { BusGuess } from '../../game/rules';
import type { CardBackId, Player } from '../../game/state';
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
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[#042317] shadow-[inset_0_0_0_1px_rgba(245,217,155,0.14),inset_0_24px_80px_rgba(245,217,155,0.08)]">
      <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_clamp(8.5rem,34vw,24rem)] gap-1 overflow-hidden">
        <TurnRail players={state.players} activePlayerId={player.id} />
        <ActionPanel
          assignmentLabel={state.deal.lastAssignment?.label}
          awaitingContinue={awaitingContinue}
          card={latestCard}
          onHome={() => setQuitOpen(true)}
          onLog={() => setLogOpen(true)}
          onRules={() => setRulesOpen(true)}
          onContinue={() => dispatch({ type: 'DEAL_CONTINUE' })}
          onGuess={(guess) => dispatch({ type: 'DEAL_GUESS', guess })}
          options={options}
          playerName={player.name}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-[1.1rem] bg-[radial-gradient(circle_at_50%_42%,rgba(19,118,82,0.78),rgba(3,28,19,0.96)_62%,rgba(0,0,0,0.36))] p-[clamp(0.45rem,1.5vw,0.75rem)] shadow-[inset_0_0_0_1px_rgba(245,217,155,0.08)]">
        <div className="flex h-full min-h-0 flex-col gap-[clamp(0.35rem,1.2dvh,0.65rem)]">
          <StageHeader
            cardBackId={state.cardBackId}
            player={player}
            shoeCount={state.shoe.length}
            subphase={state.deal.subphase}
          />

          <ActiveHand cards={player.hand} highlightedCardId={latestCard?.id} />

        </div>
      </div>
      <LogDrawer open={logOpen} onClose={() => setLogOpen(false)} />
      <Drawer open={quitOpen} title="Go Home" onClose={() => setQuitOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm leading-6 text-[#fff7e6]/82">
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
        <div className="space-y-4 text-sm leading-6 text-[#fff7e6]/82">
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
    <div className="flex shrink-0 snap-x gap-2 overflow-x-auto bg-black/12 p-1">
      {players.map((candidate) => {
        const active = candidate.id === activePlayerId;
        return (
          <div
            key={candidate.id}
            className={`min-w-[clamp(6.25rem,28vw,7.5rem)] snap-start rounded-2xl px-2 py-[clamp(0.35rem,1dvh,0.5rem)] text-center ring-1 ${
              active
                ? 'bg-[#f5d99b] text-[#142019] ring-[#f5d99b]'
                : 'bg-black/20 text-[#fff7e6]/65 ring-white/10'
            }`}
          >
            <div className="truncate text-sm font-bold">{candidate.name}</div>
            <MiniHand cards={candidate.hand} active={active} />
          </div>
        );
      })}
    </div>
  );
}

function ActionPanel({
  assignmentLabel,
  awaitingContinue,
  card,
  className = '',
  onContinue,
  onGuess,
  onHome,
  onLog,
  onRules,
  options,
  playerName
}: {
  assignmentLabel?: string;
  awaitingContinue: boolean;
  card: Card | null;
  className?: string;
  onContinue: () => void;
  onGuess: (guess: BusGuess) => void;
  onHome: () => void;
  onLog: () => void;
  onRules: () => void;
  options: GuessOption[];
  playerName: string;
}) {
  return (
    <div className={`grid min-h-0 gap-2 rounded-2xl bg-black/16 p-2 shadow-[inset_0_0_0_1px_rgba(255,247,230,0.08)] ${className}`}>
      <div className="grid grid-cols-3 gap-1">
        <IconButton label="Home" className="h-10 w-full rounded-xl" onClick={onHome}>
          <House size={18} />
        </IconButton>
        <IconButton label="Rules" className="h-10 w-full rounded-xl" onClick={onRules}>
          <BookOpen size={18} />
        </IconButton>
        <IconButton label="Game log" className="h-10 w-full rounded-xl" onClick={onLog}>
          <History size={18} />
        </IconButton>
      </div>
      <ResultPanel assignmentLabel={assignmentLabel} awaitingContinue={awaitingContinue} card={card} playerName={playerName} />
      {awaitingContinue ? (
        <Button className="min-h-12 text-base" onClick={onContinue}>
          Next
        </Button>
      ) : (
        <GuessPicker options={options} onGuess={onGuess} />
      )}
    </div>
  );
}

function MiniHand({ active, cards }: { active: boolean; cards: Card[] }) {
  if (!cards.length) {
    return <div className="mt-0.5 text-xs font-semibold opacity-70">0/4</div>;
  }

  return (
    <div className="mt-1 flex min-h-5 items-center justify-center gap-0.5">
      {cards.map((card) => (
        <MiniCard key={card.id} active={active} card={card} />
      ))}
      {Array.from({ length: Math.max(0, 4 - cards.length) }, (_, index) => (
        <span key={index} className={`h-5 w-3 rounded-sm border ${active ? 'border-[#142019]/20' : 'border-white/10'}`} />
      ))}
    </div>
  );
}

function MiniCard({ active, card }: { active: boolean; card: Card }) {
  const red = card.color === 'red';
  return (
    <span
      className={`grid h-6 w-5 place-items-center rounded-sm border text-[10px] font-black leading-none ${
        active
          ? 'border-[#142019]/20 bg-white/70'
          : 'border-black/20 bg-[#fbf2d9]'
      } ${red ? 'text-[#b72e35]' : 'text-[#111827]'}`}
      title={`${card.rank} ${card.suit}`}
    >
      <span>{card.rank}</span>
      <span className="-mt-1">{suitGlyphs[card.suit]}</span>
    </span>
  );
}

function StageHeader({
  cardBackId,
  player,
  shoeCount,
  subphase
}: {
  cardBackId: CardBackId;
  player: Player;
  shoeCount: number;
  subphase: DealSubphase;
}) {
  return (
    <div className="flex shrink-0 items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[clamp(0.75rem,2.8vw,0.9rem)] font-black uppercase tracking-[0.16em] text-[#f5d99b]">{dealSubphaseLabels[subphase]}</p>
        <h2 className="mt-0.5 truncate text-[clamp(2rem,8vw,3.2rem)] font-black leading-none text-[#fff7e6] landscape:text-[clamp(1.8rem,5vw,3rem)]">{player.name}</h2>
      </div>
      <div className="flex shrink-0 items-center gap-2 rounded-2xl bg-black/20 p-1.5 ring-1 ring-white/10 landscape:hidden">
        <CardBack id={cardBackId} size="compact" />
        <div className="text-center">
          <div className="text-lg font-black text-[#fff7e6]">{shoeCount}</div>
          <div className="text-[10px] font-black uppercase tracking-[0.12em] text-[#fff7e6]/45">deck</div>
        </div>
      </div>
    </div>
  );
}

function ActiveHand({ cards, highlightedCardId }: { cards: Card[]; highlightedCardId?: string | null }) {
  return (
    <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] rounded-[1.25rem] bg-black/16 p-3 shadow-[inset_0_0_0_1px_rgba(255,247,230,0.08)]">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-black uppercase tracking-[0.16em] text-[#f5d99b]/78">hand</div>
        <div className="rounded-full bg-black/24 px-3 py-1 text-sm font-black text-[#fff7e6]">{cards.length}/4</div>
      </div>
      <div className="grid min-h-0 grid-cols-4 items-center gap-2">
        {Array.from({ length: 4 }, (_, index) => {
          const card = cards[index];
          return (
            <div key={card?.id ?? `active-empty-${index}`} className="grid h-full min-h-0 min-w-0 w-full place-items-center">
              {card ? (
                <PlayingCard card={card} highlighted={card.id === highlightedCardId} size="hand" />
              ) : (
                <div className="grid aspect-[5/7] h-full max-h-[9rem] w-auto max-w-full place-items-center rounded-lg border border-dashed border-[#f5d99b]/20 bg-white/[0.035] text-sm font-black text-[#fff7e6]/24">
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

function ResultPanel({
  assignmentLabel,
  awaitingContinue,
  card,
  playerName
}: {
  assignmentLabel?: string;
  awaitingContinue: boolean;
  card: Card | null;
  playerName: string;
}) {
  if (!awaitingContinue) {
    return null;
  }

  return (
    <div className="shrink-0 rounded-2xl bg-[#f5d99b] px-3 py-[clamp(0.45rem,1.5dvh,0.75rem)] text-center text-[#142019] shadow-glow landscape:py-2">
      <div className="text-xs font-black uppercase tracking-[0.12em]">{card ? `${card.rank}${suitGlyphs[card.suit]}` : 'Flipped'}</div>
      <div className="mt-0.5 text-[clamp(1rem,4vw,1.25rem)] font-black">{assignmentLabel}</div>
    </div>
  );
}

function GuessPicker({ className = '', onGuess, options }: { className?: string; onGuess: (guess: BusGuess) => void; options: GuessOption[] }) {
  return (
    <div className={`grid shrink-0 gap-2 ${options.length === 2 ? 'grid-cols-2' : options.length === 3 ? 'grid-cols-3' : 'grid-cols-4'} ${className}`}>
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => onGuess(option.guess)}
          className={`min-h-[clamp(3rem,8dvh,4rem)] rounded-2xl px-2 text-[clamp(1rem,4.8vw,1.25rem)] font-black outline-none ring-1 transition focus-visible:ring-2 focus-visible:ring-[#f5d99b] active:scale-[0.98] ${optionClasses[option.tone]}`}
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
      { guess: 'black', label: 'Black', tone: 'dark' }
    ];
  }
  if (subphase === 'higherLowerSame') {
    return [
      { guess: 'higher', label: 'Higher', tone: 'dark' },
      { guess: 'lower', label: 'Lower', tone: 'dark' },
      { guess: 'same', label: 'Same', tone: 'gold' }
    ];
  }
  if (subphase === 'insideOutsideSame') {
    return [
      { guess: 'inside', label: 'Inside', tone: 'dark' },
      { guess: 'outside', label: 'Outside', tone: 'dark' },
      { guess: 'same', label: 'Same', tone: 'gold' }
    ];
  }
  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
  return suits.map((suit) => ({
    guess: suit,
    label: suitGlyphs[suit],
    tone: suit === 'hearts' || suit === 'diamonds' ? 'red' : 'dark'
  }));
}

const optionClasses = {
  dark: 'bg-[#f5d99b] text-[#142019] shadow-[inset_0_1px_0_rgba(255,255,255,0.42)] ring-white/35',
  red: 'bg-[#f5d99b] text-[#142019] shadow-[inset_0_1px_0_rgba(255,255,255,0.42)] ring-white/35',
  gold: 'bg-[#f5d99b] text-[#142019] shadow-[inset_0_1px_0_rgba(255,255,255,0.42)] ring-white/35'
};
