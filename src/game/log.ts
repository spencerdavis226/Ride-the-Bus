export type GameLogEntry = {
  id: string;
  at: number;
  text: string;
  kind: 'deal' | 'table' | 'bus' | 'system';
};

export function makeLog(text: string, kind: GameLogEntry['kind']): GameLogEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    at: Date.now(),
    text,
    kind
  };
}
