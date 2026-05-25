import { describe, expect, it } from 'vitest';
import { getDefaultHistoryFilter, makeLog, summarizeDrinkTotals, type GameLogEntry } from '../game/log';
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
