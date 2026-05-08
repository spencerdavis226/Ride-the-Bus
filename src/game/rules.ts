import type { Card, Rank } from './cards';

export type RedBlackGuess = 'red' | 'black';
export type HigherLowerSameGuess = 'higher' | 'lower' | 'same';
export type InsideOutsideSameGuess = 'inside' | 'outside' | 'same';
export type SuitGuess = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type DealGuess = RedBlackGuess | HigherLowerSameGuess | InsideOutsideSameGuess | SuitGuess;
export type BusGuess = DealGuess;

const rankValuesHighAce: Record<Rank, number> = {
  A: 14,
  K: 13,
  Q: 12,
  J: 11,
  '10': 10,
  '9': 9,
  '8': 8,
  '7': 7,
  '6': 6,
  '5': 5,
  '4': 4,
  '3': 3,
  '2': 2
};

export function isAceLowDate(date = new Date()): boolean {
  return date.getMonth() === 8 && date.getDate() === 1;
}

export function getRankValue(rank: Rank, date = new Date()): number {
  if (rank === 'A' && isAceLowDate(date)) {
    return 1;
  }
  return rankValuesHighAce[rank];
}

export function compareHigherLowerSame(previous: Card, next: Card): HigherLowerSameGuess {
  if (next.numericValue === previous.numericValue) return 'same';
  return next.numericValue > previous.numericValue ? 'higher' : 'lower';
}

export function compareInsideOutsideSame(first: Card, second: Card, next: Card): InsideOutsideSameGuess {
  const low = Math.min(first.numericValue, second.numericValue);
  const high = Math.max(first.numericValue, second.numericValue);
  if (next.numericValue === first.numericValue || next.numericValue === second.numericValue) {
    return 'same';
  }
  return next.numericValue > low && next.numericValue < high ? 'inside' : 'outside';
}

export function cansForDrinks(drinks: number): string {
  const cans = drinks / 12;
  return Number.isInteger(cans) ? String(cans) : cans.toFixed(1);
}
