import { describe, expect, it } from 'vitest';
import type { Card } from '../game/cards';
import { compareHigherLowerSame, compareInsideOutsideSame } from '../game/rules';
import { busFailureUnits, scoreHigherLowerSame, scoreInsideOutsideSame, scoreRedBlack } from '../game/scoring';

const card = (rank: string, numericValue: number, color: 'red' | 'black' = 'black'): Card => ({
  id: rank,
  deckIndex: 1,
  rank: rank as Card['rank'],
  numericValue,
  color,
  suit: color === 'red' ? 'hearts' : 'spades'
});

describe('deal scoring', () => {
  it('scores red black guesses', () => {
    expect(scoreRedBlack('red', card('9', 9, 'red'))).toMatchObject({ correct: true, direction: 'give', units: 1 });
    expect(scoreRedBlack('black', card('9', 9, 'red'))).toMatchObject({ correct: false, direction: 'take', units: 1 });
  });

  it('does not treat equal cards as higher or lower', () => {
    expect(compareHigherLowerSame(card('9', 9), card('9', 9))).toBe('same');
    expect(scoreHigherLowerSame('higher', card('9', 9), card('9', 9))).toMatchObject({ correct: false, units: 4 });
    expect(scoreHigherLowerSame('same', card('9', 9), card('9', 9))).toMatchObject({ correct: true, units: 4 });
    expect(scoreHigherLowerSame('same', card('9', 9), card('10', 10))).toMatchObject({ correct: false, units: 2 });
  });

  it('scores inside outside same with strict boundaries', () => {
    expect(compareInsideOutsideSame(card('5', 5), card('9', 9), card('7', 7))).toBe('inside');
    expect(compareInsideOutsideSame(card('5', 5), card('9', 9), card('10', 10))).toBe('outside');
    expect(compareInsideOutsideSame(card('5', 5), card('9', 9), card('5', 5))).toBe('same');
    expect(scoreInsideOutsideSame('inside', card('5', 5), card('9', 9), card('5', 5))).toMatchObject({ correct: false, units: 6 });
    expect(scoreInsideOutsideSame('same', card('5', 5), card('9', 9), card('5', 5))).toMatchObject({ correct: true, units: 6 });
    expect(scoreInsideOutsideSame('same', card('5', 5), card('9', 9), card('7', 7))).toMatchObject({ correct: false, units: 3 });
  });

  it('applies bus same-card double rules only on same-card misses', () => {
    expect(busFailureUnits(1, 'same', false)).toBe(4);
    expect(busFailureUnits(2, 'same', false)).toBe(6);
    expect(busFailureUnits(1, 'higher', true)).toBe(2);
    expect(busFailureUnits(2, 'inside', true)).toBe(3);
  });
});
