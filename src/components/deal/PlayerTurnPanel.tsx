import { dealSubphaseLabels } from '../../game/phases';
import type { DealState, Player } from '../../game/state';

export function PlayerTurnPanel({ player, deal, shoeCount }: { player: Player; deal: DealState; shoeCount: number }) {
  return (
    <div className="glass-panel rounded-xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#f5d99b]/80">{dealSubphaseLabels[deal.subphase]}</p>
          <h2 className="mt-1 text-3xl font-bold">{player.name}</h2>
          <p className="mt-2 text-sm text-[#fff7e6]/65">{promptForSubphase(deal.subphase)}</p>
        </div>
        <div className="shrink-0 rounded-lg bg-black/25 px-3 py-2 text-right ring-1 ring-white/10">
          <div className="text-lg font-bold">{player.hand.length}/4</div>
          <div className="text-xs text-[#fff7e6]/50">{shoeCount} in shoe</div>
        </div>
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
