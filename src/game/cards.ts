export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type CardColor = 'red' | 'black';
export type Rank = 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';

export type Card = {
  id: string;
  deckIndex: number;
  suit: Suit;
  color: CardColor;
  rank: Rank;
  numericValue: number;
};

export const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
export const ranks: Rank[] = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

export const suitGlyphs: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣'
};

export function getSuitColor(suit: Suit): CardColor {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
}

export function suitLabel(suit: Suit): string {
  return `${suitGlyphs[suit]} ${suit[0].toUpperCase()}${suit.slice(1)}`;
}
