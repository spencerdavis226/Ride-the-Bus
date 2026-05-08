import type { TableCard } from '../../game/state';
import { PlayingCard } from '../cards/PlayingCard';

export function BowlingTableLayout({ cards }: { cards: TableCard[] }) {
  const rows = [1, 2, 3, 4, 5] as const;
  return (
    <div className="space-y-2">
      {rows.map((row) => {
        const rowCards = cards.filter((card) => card.row === row);
        return (
          <div key={row} className={`flex justify-center gap-2 ${row === 2 ? '' : ''}`}>
            {rowCards.map((tableCard) => (
              <div key={tableCard.id} className="relative">
                <PlayingCard card={tableCard.card} faceUp={tableCard.faceUp} compact highlighted={tableCard.faceUp} />
                <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-[#f5d99b] text-xs font-bold text-[#142019]">
                  {tableCard.value}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
