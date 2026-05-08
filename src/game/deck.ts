import { getSuitColor, ranks, suits, type Card } from './cards';
import { getRankValue } from './rules';

export function calculatePhaseOneTwoDecks(playerCount: number): number {
  const requiredCards = playerCount * 4 + 11;
  return Math.max(1, Math.ceil(requiredCards / 52));
}

export function createStandardDeck(deckIndex: number, date = new Date()): Card[] {
  return suits.flatMap((suit) =>
    ranks.map((rank) => ({
      id: `${deckIndex}-${suit}-${rank}`,
      deckIndex,
      suit,
      color: getSuitColor(suit),
      rank,
      numericValue: getRankValue(rank, date)
    }))
  );
}

export function createShoe(deckCount: number, date = new Date()): Card[] {
  return Array.from({ length: deckCount }, (_, index) => createStandardDeck(index + 1, date)).flat();
}

export function shuffleFisherYates<T>(items: T[], rng: () => number = Math.random): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function drawOne(deck: Card[]): { card: Card; deck: Card[] } {
  const [card, ...remaining] = deck;
  if (!card) {
    throw new Error('Cannot draw from an empty deck');
  }
  return { card, deck: remaining };
}

export function drawMany(deck: Card[], count: number): { cards: Card[]; deck: Card[] } {
  if (deck.length < count) {
    throw new Error(`Cannot draw ${count} cards from a deck with ${deck.length} cards`);
  }
  return { cards: deck.slice(0, count), deck: deck.slice(count) };
}
