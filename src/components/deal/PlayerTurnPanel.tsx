import { dealSubphaseLabels } from '../../game/phases';
import type { DealState, Player } from '../../game/state';
import { CardStack } from '../cards/CardStack';

export function PlayerTurnPanel({ player, deal }: { player: Player; deal: DealState }) {
  return (
    <div className="glass-panel rounded-xl p-4">
      <p className="text-sm text-[#f5d99b]/75">{dealSubphaseLabels[deal.subphase]}</p>
      <h2 className="mt-1 text-3xl font-bold">{player.name}</h2>
      <p className="mt-2 text-sm text-[#fff7e6]/65">{promptForSubphase(deal.subphase)}</p>
      <div className="mt-4">
        <CardStack cards={player.hand} />
      </div>
      {deal.lastAssignment && (
        <div className="mt-4 rounded-lg bg-white/[0.09] p-3">
          <span className="font-semibold text-[#fff7e6]">{deal.lastAssignment.playerName}</span>
          <span className="text-[#fff7e6]/60">: </span>
          <span className="text-[#f5d99b]">
            {deal.lastAssignment.direction === 'give' ? 'Give' : 'Take'} {deal.lastAssignment.units}
          </span>
        </div>
      )}
    </div>
  );
}

function promptForSubphase(subphase: DealState['subphase']): string {
  if (subphase === 'redBlack') return 'Guess the color before the card flips.';
  if (subphase === 'higherLowerSame') return 'Compare against this player’s first card.';
  if (subphase === 'insideOutsideSame') return 'Compare against this player’s first two cards.';
  return 'Pick the suit for the fourth card.';
}
