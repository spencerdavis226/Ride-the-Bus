import type { Card, Suit } from './cards';
import {
  compareHigherLowerSame,
  compareInsideOutsideSame,
  type HigherLowerSameGuess,
  type InsideOutsideSameGuess,
  type RedBlackGuess
} from './rules';

export type ScoreResult = {
  correct: boolean;
  direction: 'give' | 'take';
  units: number;
  actual: string;
};

export function scoreRedBlack(guess: RedBlackGuess, card: Card): ScoreResult {
  const correct = guess === card.color;
  return {
    correct,
    direction: correct ? 'give' : 'take',
    units: 1,
    actual: card.color
  };
}

export function scoreHigherLowerSame(guess: HigherLowerSameGuess, previous: Card, card: Card): ScoreResult {
  const actual = compareHigherLowerSame(previous, card);
  const correct = guess === actual;
  let units = 2;
  if (actual === 'same' && guess === 'same') units = 4;
  if (actual === 'same' && guess !== 'same') units = 4;
  return {
    correct,
    direction: correct ? 'give' : 'take',
    units,
    actual
  };
}

export function scoreInsideOutsideSame(
  guess: InsideOutsideSameGuess,
  first: Card,
  second: Card,
  card: Card
): ScoreResult {
  const actual = compareInsideOutsideSame(first, second, card);
  const correct = guess === actual;
  let units = 3;
  if (actual === 'same' && guess === 'same') units = 6;
  if (actual === 'same' && guess !== 'same') units = 6;
  return {
    correct,
    direction: correct ? 'give' : 'take',
    units,
    actual
  };
}

export function scoreSuit(guess: Suit, card: Card): ScoreResult {
  const correct = guess === card.suit;
  return {
    correct,
    direction: correct ? 'give' : 'take',
    units: 4,
    actual: card.suit
  };
}

export function busFailureUnits(positionIndex: number, actual: string, guessedSame: boolean): number {
  const base = positionIndex + 1;
  if (positionIndex === 1 && actual === 'same' && !guessedSame) return 4;
  if (positionIndex === 2 && actual === 'same' && !guessedSame) return 6;
  return base;
}
