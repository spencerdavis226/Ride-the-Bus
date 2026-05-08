import { describe, expect, it } from 'vitest';
import { calculatePhaseOneTwoDecks, createShoe, createStandardDeck, shuffleFisherYates } from '../game/deck';
import { getRankValue, isAceLowDate } from '../game/rules';

describe('deck rules', () => {
  it('calculates phase one and two deck counts from player count', () => {
    expect(calculatePhaseOneTwoDecks(2)).toBe(1);
    expect(calculatePhaseOneTwoDecks(10)).toBe(1);
    expect(calculatePhaseOneTwoDecks(11)).toBe(2);
    expect(calculatePhaseOneTwoDecks(24)).toBe(3);
  });

  it('creates one or multiple decks for phase one and two', () => {
    expect(createShoe(1)).toHaveLength(52);
    expect(createShoe(3)).toHaveLength(156);
  });

  it('creates a fresh single deck for the bus', () => {
    expect(createStandardDeck(1)).toHaveLength(52);
  });

  it('keeps shuffled cards unique and complete', () => {
    const deck = createStandardDeck(1);
    const shuffled = shuffleFisherYates(deck, () => 0.42);
    expect(shuffled).toHaveLength(52);
    expect(new Set(shuffled.map((card) => card.id)).size).toBe(52);
  });

  it('treats aces high except on September 1 local date', () => {
    expect(isAceLowDate(new Date(2026, 8, 1))).toBe(true);
    expect(getRankValue('A', new Date(2026, 8, 1))).toBe(1);
    expect(getRankValue('A', new Date(2026, 8, 2))).toBe(14);
  });
});
