import { describe, expect, it } from 'vitest';
import {
  getDefaultHistoryFilter,
  makeLog,
  summarizeDrinkTotals,
  summarizeTableHits,
  tableHitCountLabel,
  tableHitLine,
  tableHitTitle,
  type GameLogEntry
} from '../game/log';
import type { DrinkAssignment } from '../game/state';

const assignment = (
  playerId: string,
  playerName: string,
  direction: DrinkAssignment['direction'],
  units: number,
  source: DrinkAssignment['source'] = 'deal'
): DrinkAssignment => ({
  playerId,
  playerName,
  direction,
  units,
  source,
  label: `${playerName}: ${direction === 'take' ? 'Take' : 'Give'} ${units}`
});

describe('history log helpers', () => {
  it('keeps text-only logs readable while supporting structured fields', () => {
    const entry = makeLog('Old readable text', 'system');

    expect(entry.text).toBe('Old readable text');
    expect(entry.title).toBeUndefined();
    expect(entry.assignments).toBeUndefined();
  });

  it('summarizes give and take totals from structured assignments', () => {
    const entries: GameLogEntry[] = [
      makeLog('Deal miss', 'deal', {
        assignments: [assignment('p1', 'Alex', 'take', 1)]
      }),
      makeLog('Table pair', 'table', {
        assignments: [
          assignment('p1', 'Alex', 'give', 3, 'table'),
          assignment('p1', 'Alex', 'give', 3, 'table'),
          assignment('p2', 'Sam', 'give', 3, 'table')
        ]
      }),
      makeLog('Bus fail', 'bus', {
        assignments: [assignment('bus-riders', 'Riders', 'take', 4, 'bus')]
      })
    ];

    expect(summarizeDrinkTotals(entries)).toEqual([
      { playerId: 'bus-riders', playerName: 'Riders', give: 0, take: 4 },
      { playerId: 'p1', playerName: 'Alex', give: 6, take: 1 },
      { playerId: 'p2', playerName: 'Sam', give: 3, take: 0 }
    ]);
  });

  it('groups table hits by name and sums duplicate card matches', () => {
    const summaries = summarizeTableHits([
      assignment('p1', 'Alex', 'give', 3, 'table'),
      assignment('p1', 'Alex', 'give', 3, 'table'),
      assignment('p2', 'Sam', 'give', 3, 'table')
    ]);

    expect(summaries).toEqual([
      { playerId: 'p1', playerName: 'Alex', units: 6, count: 2 },
      { playerId: 'p2', playerName: 'Sam', units: 3, count: 1 }
    ]);
    expect(tableHitLine(summaries[0])).toBe('Alex gives 6');
    expect(tableHitCountLabel(summaries[0])).toBe('2 cards');
    expect(tableHitCountLabel(summaries[1])).toBeNull();
  });

  it('formats named table titles for empty, one, three, and overflow hit lists', () => {
    expect(tableHitTitle([])).toBe('No drinks');
    expect(tableHitTitle([assignment('p1', 'Alex', 'give', 4, 'table')])).toBe('Alex gives 4');
    expect(tableHitTitle([
      assignment('p1', 'Alex', 'give', 2, 'table'),
      assignment('p2', 'Sam', 'give', 2, 'table'),
      assignment('p3', 'Lee', 'give', 2, 'table')
    ])).toBe('Alex, Sam, Lee give 6');
    expect(tableHitTitle([
      assignment('p1', 'Alex', 'give', 1, 'table'),
      assignment('p2', 'Sam', 'give', 1, 'table'),
      assignment('p3', 'Lee', 'give', 1, 'table'),
      assignment('p4', 'Jo', 'give', 1, 'table')
    ])).toBe('Alex, Sam, Lee +1 more give 4');
  });

  it('keeps deal summaries scoped away from table and bus entries', () => {
    const entries: GameLogEntry[] = [
      makeLog('Deal miss', 'deal', {
        assignments: [assignment('p1', 'Alex', 'take', 2)]
      }),
      makeLog('Table pair', 'table', {
        assignments: [assignment('p1', 'Alex', 'give', 4, 'table')]
      }),
      makeLog('Bus fail', 'bus', {
        assignments: [assignment('bus-riders', 'Riders', 'take', 3, 'bus')]
      })
    ];

    expect(summarizeDrinkTotals(entries.filter((entry) => entry.kind === 'deal'))).toEqual([
      { playerId: 'p1', playerName: 'Alex', give: 0, take: 2 }
    ]);
  });

  it('keeps bus summaries fresh from deal and table entries', () => {
    const entries: GameLogEntry[] = [
      makeLog('Deal miss', 'deal', {
        assignments: [assignment('p1', 'Alex', 'take', 2)]
      }),
      makeLog('Table pair', 'table', {
        assignments: [assignment('p1', 'Alex', 'give', 4, 'table')]
      }),
      makeLog('Bus fail', 'bus', {
        assignments: [assignment('bus-riders', 'Riders', 'take', 3, 'bus')]
      })
    ];

    expect(summarizeDrinkTotals(entries.filter((entry) => entry.kind === 'bus'))).toEqual([
      { playerId: 'bus-riders', playerName: 'Riders', give: 0, take: 3 }
    ]);
  });

  it('chooses the default history tab from the active phase', () => {
    expect(getDefaultHistoryFilter('deal', null)).toBe('deal');
    expect(getDefaultHistoryFilter('table', null)).toBe('table');
    expect(getDefaultHistoryFilter('busIntro', null)).toBe('bus');
    expect(getDefaultHistoryFilter('bus', null)).toBe('bus');
    expect(getDefaultHistoryFilter('gameOver', 'escaped')).toBe('bus');
    expect(getDefaultHistoryFilter('gameOver', 'deckExhausted')).toBe('bus');
    expect(getDefaultHistoryFilter('gameOver', 'emptyBus')).toBe('all');
    expect(getDefaultHistoryFilter('setup', null)).toBe('all');
  });
});
