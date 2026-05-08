import { describe, expect, it } from 'vitest';
import type { Card } from '../game/cards';
import { replaceBusCards } from '../game/engine';

const card = (id: string): Card => ({
  id,
  deckIndex: 1,
  suit: 'spades',
  color: 'black',
  rank: '2',
  numericValue: 2
});

describe('bus replacement rules', () => {
  it('replaces cards one through N only', () => {
    const visible = [card('v1'), card('v2'), card('v3'), card('v4')];
    const deck = [card('n1'), card('n2'), card('n3')];
    const result = replaceBusCards(visible, deck, 3, 'singleDeck');
    expect(result.visibleCards.map((next) => next?.id)).toEqual(['n1', 'n2', 'n3', 'v4']);
    expect(result.deck).toHaveLength(0);
    expect(result.exhausted).toBe(false);
  });

  it('stops single-deck bus on deck exhaustion', () => {
    const visible = [card('v1'), card('v2'), card('v3'), card('v4')];
    const result = replaceBusCards(visible, [card('n1')], 2, 'singleDeck');
    expect(result.exhausted).toBe(true);
    expect(result.visibleCards.map((next) => next?.id ?? null)).toEqual([null, null, 'v3', 'v4']);
  });

  it('reshuffles a fresh single deck for endless bus', () => {
    const visible = [card('v1'), card('v2'), card('v3'), card('v4')];
    const result = replaceBusCards(visible, [], 4, 'endless', () => 0.1);
    expect(result.exhausted).toBe(false);
    expect(result.reshuffles).toBe(1);
    expect(result.deck).toHaveLength(48);
  });
});
