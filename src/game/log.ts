import type { DrinkAssignment } from './state';
import type { GameOverReason, GamePhase } from './state';

export type GameLogKind = 'deal' | 'table' | 'bus' | 'system';
export type GameLogPhase = Exclude<GameLogKind, 'system'>;
export type HistoryFilter = 'all' | GameLogPhase;
export type GameLogResult = 'correct' | 'wrong' | 'neutral';

export type GameLogEntry = {
  id: string;
  at: number;
  text: string;
  kind: GameLogKind;
  phase?: GameLogPhase;
  title?: string;
  detail?: string;
  assignments?: DrinkAssignment[];
  cardLabel?: string;
  result?: GameLogResult;
};

type LogDetails = Omit<Partial<GameLogEntry>, 'id' | 'at' | 'text' | 'kind'>;

export type DrinkTotal = {
  playerId: string;
  playerName: string;
  give: number;
  take: number;
};

export function makeLog(text: string, kind: GameLogKind, details: LogDetails = {}): GameLogEntry {
  const now = Date.now();
  return {
    id: `${now}-${Math.random().toString(36).slice(2)}`,
    at: now,
    text,
    kind,
    phase: kind === 'system' ? details.phase : details.phase ?? kind,
    ...details
  };
}

export function summarizeDrinkTotals(entries: GameLogEntry[]): DrinkTotal[] {
  const totals = entries.reduce<Record<string, DrinkTotal>>((acc, entry) => {
    entry.assignments?.forEach((assignment) => {
      acc[assignment.playerId] = acc[assignment.playerId] ?? {
        playerId: assignment.playerId,
        playerName: assignment.playerName,
        give: 0,
        take: 0
      };
      acc[assignment.playerId][assignment.direction] += assignment.units;
    });
    return acc;
  }, {});

  return Object.values(totals).sort((a, b) => {
    const debtDelta = b.take - a.take;
    if (debtDelta !== 0) return debtDelta;
    const giveDelta = b.give - a.give;
    if (giveDelta !== 0) return giveDelta;
    return a.playerName.localeCompare(b.playerName);
  });
}

export function getDefaultHistoryFilter(phase: GamePhase, gameOverReason: GameOverReason | null): HistoryFilter {
  if (phase === 'deal') return 'deal';
  if (phase === 'table') return 'table';
  if (phase === 'busIntro' || phase === 'bus') return 'bus';
  if (phase === 'gameOver' && gameOverReason !== 'emptyBus') return 'bus';
  return 'all';
}
