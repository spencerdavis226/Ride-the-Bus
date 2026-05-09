import { describe, expect, it } from 'vitest';
import type { Card } from '../game/cards';
import { createTableFromShoe, determineBusRiders, matchTableCard } from '../game/engine';
import type { Player, TableCard } from '../game/state';

const c = (id: string, value: number, rank = String(value)): Card => ({
  id,
  deckIndex: 1,
  suit: 'spades',
  color: 'black',
  rank: rank as Card['rank'],
  numericValue: value
});

describe('table rules', () => {
  it('creates the eleven-card table layout', () => {
    const shoe = Array.from({ length: 20 }, (_, index) => c(`card-${index}`, index + 2, '2'));
    const { table } = createTableFromShoe(shoe);
    expect(table.cards).toHaveLength(11);
    expect(table.cards.map((card) => card.row)).toEqual([1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5]);
    expect(table.cards.map((card) => card.value)).toEqual([1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5]);
  });

  it('autoplays all matching hand cards with one assignment per card', () => {
    const players: Player[] = [
      { id: 'p1', name: 'Spencer', hand: [c('a', 9, '9'), c('b', 9, '9'), c('c', 5, '5')] },
      { id: 'p2', name: 'Alex', hand: [c('d', 9, '9')] }
    ];
    const tableCard: TableCard = {
      id: 'table',
      row: 3,
      value: 3,
      card: c('table-card', 9, '9'),
      faceUp: false,
      matchedAssignments: []
    };
    const result = matchTableCard(players, tableCard);
    expect(result.assignments).toHaveLength(3);
    expect(result.assignments.map((assignment) => assignment.label)).toEqual(['Spencer: Give 3', 'Spencer: Give 3', 'Alex: Give 3']);
    expect(result.players[0].hand.map((card) => card.id)).toEqual(['c']);
    expect(result.players[1].hand).toEqual([]);
  });

  it('determines bus riders including ties and empty bus', () => {
    const players: Player[] = [
      { id: 'p1', name: 'A', hand: [c('a', 2)] },
      { id: 'p2', name: 'B', hand: [c('b', 3), c('c', 4)] },
      { id: 'p3', name: 'C', hand: [c('d', 5), c('e', 6)] }
    ];
    expect(determineBusRiders(players).map((player) => player.name)).toEqual(['B', 'C']);
    expect(determineBusRiders(players.map((player) => ({ ...player, hand: [] })))).toEqual([]);
  });
});
