import { suitGlyphs } from '../../game/cards';
import type { TableCard } from '../../game/state';

export function HistoryTimeline({ cards }: { cards: TableCard[] }) {
  const flipped = cards.filter((card) => card.faceUp);
  if (!flipped.length) {
    return <p className="text-sm text-[#fff7e6]/60">No table cards flipped yet.</p>;
  }
  return (
    <div className="space-y-3">
      {flipped.map((card) => (
        <div key={card.id} className="rounded-lg bg-white/[0.07] p-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Row {card.row}</span>
            <span className={card.card.color === 'red' ? 'text-[#ff7a7a]' : 'text-[#fff7e6]'}>
              {card.card.rank} {suitGlyphs[card.card.suit]}
            </span>
          </div>
          <div className="mt-2 space-y-1 text-sm text-[#fff7e6]/72">
            {card.matchedAssignments.length ? (
              card.matchedAssignments.map((assignment, index) => <p key={`${assignment.playerId}-${index}`}>{assignment.label}</p>)
            ) : (
              <p>No matches.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
