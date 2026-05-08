import { useEffect, useState } from 'react';
import { useGame } from '../../app/GameProvider';
import { suitGlyphs, type Card, type Suit } from '../../game/cards';
import { dealSubphaseLabels, type DealSubphase } from '../../game/phases';
import type { BusGuess } from '../../game/rules';
import type { CardBackId, Player } from '../../game/state';
import { CardBack } from '../cards/CardBack';
import { PlayingCard } from '../cards/PlayingCard';

type GuessOption = {
  guess: BusGuess;
  label: string;
  tone: 'dark' | 'red' | 'gold';
};

export function DealScreen() {
  const { state, dispatch } = useGame();
  const player = state.players[state.deal.playerIndex];
  const [selectedGuess, setSelectedGuess] = useState<BusGuess | null>(null);
  const latestPlayerId = state.deal.lastAssignment?.playerId;
  const latestPlayer = latestPlayerId ? state.players.find((candidate) => candidate.id === latestPlayerId) : null;
  const latestCard = latestPlayer?.hand[latestPlayer.hand.length - 1] ?? null;
  const options = getGuessOptions(state.deal.subphase);

  useEffect(() => {
    setSelectedGuess(null);
  }, [player.id, player.hand.length, state.deal.subphase]);

  function flipSelectedGuess() {
    if (!selectedGuess) return;
    dispatch({ type: 'DEAL_GUESS', guess: selectedGuess });
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden">
      <TurnRail players={state.players} activePlayerId={player.id} latestPlayerId={latestPlayerId} />

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-[#f5d99b]/18 bg-[#062119]/80 p-3 shadow-card sm:p-4">
        <div className="flex h-full min-h-0 flex-col gap-3">
          <div className="flex shrink-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#f5d99b]">{dealSubphaseLabels[state.deal.subphase]}</p>
              <h2 className="truncate text-4xl font-black leading-none text-[#fff7e6]">{player.name}</h2>
            </div>
            <div className="rounded-xl bg-black/25 px-3 py-2 text-right ring-1 ring-white/10">
              <div className="text-2xl font-black">{player.hand.length}/4</div>
              <div className="text-xs uppercase tracking-[0.14em] text-[#fff7e6]/50">hand</div>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 place-items-center rounded-2xl bg-[radial-gradient(circle_at_center,rgba(245,217,155,0.12),rgba(0,0,0,0)_62%)]">
            <div className="grid w-full max-w-xl grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
              <DeckButton
                armed={Boolean(selectedGuess)}
                cardBackId={state.cardBackId}
                count={state.shoe.length}
                selectedLabel={selectedGuess ? labelForGuess(selectedGuess) : null}
                onFlip={flipSelectedGuess}
              />
              <div className="text-2xl font-black text-[#f5d99b]/70">→</div>
              <RevealPile card={latestCard} playerName={latestPlayer?.name} assignmentLabel={state.deal.lastAssignment?.label} />
            </div>
          </div>

          <GuessPicker options={options} selectedGuess={selectedGuess} onSelect={setSelectedGuess} />
          <ActiveHand cards={player.hand} highlightedCardId={latestPlayerId === player.id ? latestCard?.id : null} />
        </div>
      </div>
    </section>
  );
}

function TurnRail({
  activePlayerId,
  latestPlayerId,
  players
}: {
  activePlayerId: string;
  latestPlayerId?: string;
  players: Player[];
}) {
  return (
    <div className="mb-3 flex shrink-0 gap-2 overflow-x-auto pb-1">
      {players.map((candidate) => {
        const active = candidate.id === activePlayerId;
        const latest = candidate.id === latestPlayerId;
        return (
          <div
            key={candidate.id}
            className={`min-w-28 rounded-xl px-3 py-2 text-center ring-1 ${
              active
                ? 'bg-[#f5d99b] text-[#142019] ring-[#f5d99b]'
                : latest
                  ? 'bg-white/14 text-[#fff7e6] ring-[#f5d99b]/45'
                  : 'bg-black/20 text-[#fff7e6]/65 ring-white/10'
            }`}
          >
            <div className="truncate text-sm font-bold">{candidate.name}</div>
            <div className="text-xs font-semibold opacity-75">{candidate.hand.length}/4</div>
          </div>
        );
      })}
    </div>
  );
}

function DeckButton({
  armed,
  cardBackId,
  count,
  onFlip,
  selectedLabel
}: {
  armed: boolean;
  cardBackId: CardBackId;
  count: number;
  onFlip: () => void;
  selectedLabel: string | null;
}) {
  return (
    <button
      type="button"
      onClick={onFlip}
      disabled={!armed}
      className={`group grid justify-items-center gap-3 rounded-2xl p-2 text-center outline-none transition focus-visible:ring-2 focus-visible:ring-[#f5d99b] disabled:opacity-65 ${
        armed ? 'active:scale-[0.98]' : ''
      }`}
    >
      <div className="relative h-48 w-36">
        <div className="absolute left-3 top-2 rotate-6 transition group-active:translate-y-1">
          <CardBack id={cardBackId} size="hero" />
        </div>
        <div className="absolute left-1 top-0 rotate-2 transition group-active:translate-y-1">
          <CardBack id={cardBackId} size="hero" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-black text-[#fff7e6]">{count}</div>
        <div className="text-xs uppercase tracking-[0.16em] text-[#fff7e6]/55">cards left</div>
        <div className={`mt-2 text-sm font-bold ${armed ? 'text-[#f5d99b]' : 'text-[#fff7e6]/45'}`}>
          {selectedLabel ? `Tap deck: ${selectedLabel}` : 'Pick a guess'}
        </div>
      </div>
    </button>
  );
}

function RevealPile({
  assignmentLabel,
  card,
  playerName
}: {
  assignmentLabel?: string;
  card: Card | null;
  playerName?: string;
}) {
  return (
    <div className="grid justify-items-center gap-3 text-center">
      {card ? (
        <PlayingCard card={card} highlighted size="hero" />
      ) : (
        <div className="grid h-44 w-32 place-items-center rounded-lg border-2 border-dashed border-[#f5d99b]/25 bg-black/15 text-sm font-bold text-[#fff7e6]/40">
          Flip
        </div>
      )}
      <div className="min-h-14">
        <div className="text-sm font-bold text-[#fff7e6]">{card && playerName ? `${playerName} flipped` : 'Next card'}</div>
        <div className="mt-1 text-sm font-semibold text-[#f5d99b]">{assignmentLabel ?? 'Waiting on the deck'}</div>
      </div>
    </div>
  );
}

function GuessPicker({
  onSelect,
  options,
  selectedGuess
}: {
  onSelect: (guess: BusGuess) => void;
  options: GuessOption[];
  selectedGuess: BusGuess | null;
}) {
  return (
    <div className={`grid shrink-0 gap-2 ${options.length === 2 ? 'grid-cols-2' : options.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => onSelect(option.guess)}
          className={`min-h-14 rounded-xl px-2 text-lg font-black outline-none ring-1 transition focus-visible:ring-2 focus-visible:ring-[#f5d99b] active:scale-[0.98] ${
            selectedGuess === option.guess ? selectedClasses[option.tone] : optionClasses[option.tone]
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ActiveHand({ cards, highlightedCardId }: { cards: Card[]; highlightedCardId?: string | null }) {
  return (
    <div className="shrink-0 rounded-2xl bg-black/20 p-3 ring-1 ring-white/10">
      <div className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#f5d99b]/75">Current hand</div>
      <div className="flex min-h-28 items-center justify-center">
        {Array.from({ length: 4 }, (_, index) => {
          const card = cards[index];
          return (
            <div key={card?.id ?? `active-empty-${index}`} className={index > 0 ? '-ml-5' : ''}>
              {card ? (
                <PlayingCard card={card} highlighted={card.id === highlightedCardId} />
              ) : (
                <div className="grid h-28 w-20 place-items-center rounded-lg border border-dashed border-white/15 bg-white/[0.03] text-xs font-bold text-[#fff7e6]/25">
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

function labelForGuess(guess: BusGuess): string {
  if (guess === 'spades' || guess === 'hearts' || guess === 'diamonds' || guess === 'clubs') return suitGlyphs[guess];
  return guess.charAt(0).toUpperCase() + guess.slice(1);
}

const optionClasses = {
  dark: 'bg-white/[0.1] text-[#fff7e6] ring-white/12',
  red: 'bg-[#b72e35]/82 text-white ring-[#ff9a9a]/25',
  gold: 'bg-[#f5d99b]/88 text-[#142019] ring-[#f5d99b]/40'
};

const selectedClasses = {
  dark: 'bg-[#fff7e6] text-[#111827] ring-[#f5d99b]',
  red: 'bg-[#e33b46] text-white ring-[#ffd1d1]',
  gold: 'bg-[#f5d99b] text-[#142019] ring-white'
};
