import { useGame } from '../../app/GameProvider';
import { suitGlyphs, type Card, type Suit } from '../../game/cards';
import { dealSubphaseLabels, type DealSubphase } from '../../game/phases';
import type { BusGuess } from '../../game/rules';
import type { CardBackId, Player } from '../../game/state';
import { CardBack } from '../cards/CardBack';
import { PlayingCard } from '../cards/PlayingCard';
import { Button } from '../common/Button';

type GuessOption = {
  guess: BusGuess;
  label: string;
  tone: 'dark' | 'red' | 'gold';
};

export function DealScreen() {
  const { state, dispatch } = useGame();
  const player = state.players[state.deal.playerIndex];
  const awaitingContinue = state.deal.awaitingContinue;
  const latestCard = awaitingContinue ? player.hand[player.hand.length - 1] : null;
  const options = getGuessOptions(state.deal.subphase);

  return (
    <section className="flex min-h-full min-w-0 flex-col overflow-hidden rounded-[2rem] bg-[#042317] p-2 shadow-[inset_0_0_0_1px_rgba(245,217,155,0.14),inset_0_24px_80px_rgba(245,217,155,0.08)]">
      <div className="mb-2 shrink-0 overflow-hidden rounded-[1.6rem]">
        <TurnRail players={state.players} activePlayerId={player.id} />
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_50%_42%,rgba(19,118,82,0.78),rgba(3,28,19,0.96)_62%,rgba(0,0,0,0.36))] p-3 shadow-[inset_0_0_0_1px_rgba(245,217,155,0.08)] sm:p-5">
        <div className="relative flex h-full min-h-0 flex-col gap-3">
          <StageHeader
            cardBackId={state.cardBackId}
            player={player}
            shoeCount={state.shoe.length}
            subphase={state.deal.subphase}
          />

          <ActiveHand cards={player.hand} highlightedCardId={latestCard?.id} />

          <ResultPanel
            assignmentLabel={state.deal.lastAssignment?.label}
            awaitingContinue={awaitingContinue}
            card={latestCard}
            playerName={player.name}
          />

          {awaitingContinue ? (
            <Button className="shrink-0 text-lg" onClick={() => dispatch({ type: 'DEAL_CONTINUE' })}>
              Next
            </Button>
          ) : (
            <GuessPicker options={options} onGuess={(guess) => dispatch({ type: 'DEAL_GUESS', guess })} />
          )}
        </div>
      </div>
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
            className={`min-w-[7.5rem] snap-start rounded-2xl px-3 py-2 text-center ring-1 ${
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

function MiniHand({ active, cards }: { active: boolean; cards: Card[] }) {
  if (!cards.length) {
    return <div className="mt-1 text-xs font-semibold opacity-70">0/4</div>;
  }

  return (
    <div className="mt-1 flex min-h-6 items-center justify-center gap-1">
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
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#f5d99b]">{dealSubphaseLabels[subphase]}</p>
        <h2 className="mt-1 truncate text-5xl font-black leading-none text-[#fff7e6]">{player.name}</h2>
      </div>
      <div className="grid shrink-0 justify-items-center gap-1">
        <div className="relative h-20 w-16">
          <div className="absolute left-1 top-1 rotate-6 opacity-70">
            <CardBack id={cardBackId} compact />
          </div>
          <div className="absolute left-0 top-0 -rotate-3">
            <CardBack id={cardBackId} compact />
          </div>
        </div>
        <div className="rounded-full bg-black/28 px-3 py-1 text-xs font-black text-[#fff7e6] ring-1 ring-white/10">{shoeCount}</div>
      </div>
    </div>
  );
}

function ActiveHand({ cards, highlightedCardId }: { cards: Card[]; highlightedCardId?: string | null }) {
  return (
    <div className="grid min-h-[clamp(14rem,42dvh,26rem)] flex-1 content-center rounded-[1.25rem] bg-black/16 p-3 shadow-[inset_0_0_0_1px_rgba(255,247,230,0.08)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-black uppercase tracking-[0.16em] text-[#f5d99b]/78">hand</div>
        <div className="rounded-full bg-black/24 px-3 py-1 text-sm font-black text-[#fff7e6]">{cards.length}/4</div>
      </div>
      <div className="grid min-h-44 grid-cols-4 items-center gap-2">
        {Array.from({ length: 4 }, (_, index) => {
          const card = cards[index];
          return (
            <div key={card?.id ?? `active-empty-${index}`} className="grid min-w-0 place-items-center">
              {card ? (
                <PlayingCard card={card} highlighted={card.id === highlightedCardId} size="hand" />
              ) : (
                <div className="grid aspect-[5/7] w-full max-w-[5.75rem] place-items-center rounded-lg border border-dashed border-[#f5d99b]/20 bg-white/[0.035] text-sm font-black text-[#fff7e6]/24">
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
    return (
      <div className="shrink-0 rounded-2xl bg-black/20 px-4 py-3 text-center ring-1 ring-white/10">
        <div className="text-sm font-bold text-[#fff7e6]/62">Tap a guess to flip straight into {playerName}'s hand.</div>
      </div>
    );
  }

  return (
    <div className="shrink-0 rounded-2xl bg-[#f5d99b] px-4 py-3 text-center text-[#142019] shadow-glow">
      <div className="text-sm font-black uppercase tracking-[0.12em]">{card ? `${card.rank}${suitGlyphs[card.suit]}` : 'Flipped'}</div>
      <div className="mt-1 text-xl font-black">{assignmentLabel}</div>
    </div>
  );
}

function GuessPicker({ onGuess, options }: { onGuess: (guess: BusGuess) => void; options: GuessOption[] }) {
  return (
    <div className={`grid shrink-0 gap-2 ${options.length === 2 ? 'grid-cols-2' : options.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => onGuess(option.guess)}
          className={`min-h-16 rounded-2xl px-2 text-xl font-black outline-none ring-1 transition focus-visible:ring-2 focus-visible:ring-[#f5d99b] active:scale-[0.98] ${optionClasses[option.tone]}`}
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
  dark: 'bg-[#111719] text-[#fff7e6] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-white/14',
  red: 'bg-[#c8313b] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_24px_rgba(184,46,53,0.24)] ring-[#ffb4b4]/28',
  gold: 'bg-[#f5d99b] text-[#142019] shadow-[inset_0_1px_0_rgba(255,255,255,0.42)] ring-white/35'
};
