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

export function cardNumericValue(card: Card, date = new Date()): number {
  return getRankValue(card.rank, date);
}

export function compareHigherLowerSame(previous: Card, next: Card, date = new Date()): HigherLowerSameGuess {
  const previousValue = cardNumericValue(previous, date);
  const nextValue = cardNumericValue(next, date);
  if (nextValue === previousValue) return 'same';
  return nextValue > previousValue ? 'higher' : 'lower';
}

export function compareInsideOutsideSame(
  first: Card,
  second: Card,
  next: Card,
  date = new Date()
): InsideOutsideSameGuess {
  const firstValue = cardNumericValue(first, date);
  const secondValue = cardNumericValue(second, date);
  const nextValue = cardNumericValue(next, date);
  const low = Math.min(firstValue, secondValue);
  const high = Math.max(firstValue, secondValue);
  if (nextValue === firstValue || nextValue === secondValue) {
    return 'same';
  }
  return nextValue > low && nextValue < high ? 'inside' : 'outside';
}

export function cansForDrinks(drinks: number): string {
  const cans = drinks / 12;
  return Number.isInteger(cans) ? String(cans) : cans.toFixed(1);
}
