import { useGame } from '../../app/GameProvider';
import type { Card } from '../../game/cards';
import type { CardBackId } from '../../game/state';
import { BottomActionBar } from '../layout/BottomActionBar';
import { CardBack } from '../cards/CardBack';
import { PlayingCard } from '../cards/PlayingCard';
import { GuessControls } from './GuessControls';
import { PlayerTurnPanel } from './PlayerTurnPanel';

export function DealScreen() {
  const { state, dispatch } = useGame();
  const player = state.players[state.deal.playerIndex];
  const latestPlayerId = state.deal.lastAssignment?.playerId;
  const latestPlayer = latestPlayerId ? state.players.find((candidate) => candidate.id === latestPlayerId) : null;
  const latestCard = latestPlayer?.hand[latestPlayer.hand.length - 1] ?? null;

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3">
      <PlayerTurnPanel player={player} deal={state.deal} shoeCount={state.shoe.length} />
      <div className="glass-panel flex min-h-0 flex-1 flex-col gap-4 rounded-xl p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#f5d99b]/65">On the felt</p>
            <h2 className="text-xl font-bold">Deal the hands</h2>
          </div>
          <DeckPile cardBackId={state.cardBackId} count={state.shoe.length} />
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
          {state.players.map((candidate) => (
            <PlayerDealMat
              key={candidate.id}
              active={candidate.id === player.id}
              cards={candidate.hand}
              highlightedCardId={candidate.id === latestPlayerId ? latestCard?.id : null}
              name={candidate.name}
            />
          ))}
        </div>
      </div>
      <BottomActionBar>
        <GuessControls subphase={state.deal.subphase} onGuess={(guess) => dispatch({ type: 'DEAL_GUESS', guess })} />
      </BottomActionBar>
    </section>
  );
}

function DeckPile({ cardBackId, count }: { cardBackId: CardBackId; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-20 w-16">
        <div className="absolute left-2 top-1 rotate-6">
          <CardBack id={cardBackId} compact />
        </div>
        <div className="absolute left-1 top-0 rotate-2">
          <CardBack id={cardBackId} compact />
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-[#fff7e6]">{count}</div>
        <div className="text-xs uppercase tracking-[0.14em] text-[#fff7e6]/50">cards left</div>
      </div>
    </div>
  );
}

function PlayerDealMat({
  active,
  cards,
  highlightedCardId,
  name
}: {
  active: boolean;
  cards: Card[];
  highlightedCardId?: string | null;
  name: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-3 transition ${
        active ? 'border-[#f5d99b]/80 bg-[#f5d99b]/10 shadow-glow' : 'border-white/10 bg-black/20'
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3 className="truncate text-base font-bold">{name}</h3>
          <p className={`text-xs ${active ? 'text-[#f5d99b]' : 'text-[#fff7e6]/50'}`}>{active ? 'Waiting on a guess' : `${cards.length}/4 dealt`}</p>
        </div>
        <span className="rounded-full bg-black/25 px-2 py-1 text-xs font-semibold text-[#fff7e6]/70">{cards.length}/4</span>
      </div>
      <div className="flex min-h-32 items-center">
        {Array.from({ length: 4 }, (_, index) => {
          const card = cards[index];
          return (
            <div key={card?.id ?? `empty-${index}`} className={index > 0 ? '-ml-7 sm:-ml-5' : ''}>
              {card ? (
                <PlayingCard card={card} highlighted={card.id === highlightedCardId} />
              ) : (
                <div className="grid h-28 w-20 place-items-center rounded-lg border border-dashed border-white/15 bg-white/[0.03] text-xs font-semibold text-[#fff7e6]/25">
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
