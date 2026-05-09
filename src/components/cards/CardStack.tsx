import type { Card } from '../../game/cards';
import { PlayingCard } from './PlayingCard';

export function CardStack({ cards, maxVisible = 4 }: { cards: Card[]; maxVisible?: number }) {
  const visible = cards.slice(0, maxVisible);
  return (
    <div className="flex min-h-16 items-center">
      {visible.map((card, index) => (
        <div key={card.id} className={index > 0 ? '-ml-8' : ''}>
          <PlayingCard card={card} compact />
        </div>
      ))}
      {cards.length > maxVisible && <span className="ml-2 text-sm font-semibold text-gold">+{cards.length - maxVisible}</span>}
    </div>
  );
}
