import type { DrinkAssignment } from '../../game/state';

export function TableFlipSummary({ assignments }: { assignments: DrinkAssignment[] }) {
  if (!assignments.length) {
    return (
      <div className="rounded-2xl bg-[var(--rtb-surface-soft)] px-4 py-3.5 text-sm text-[var(--rtb-text-muted)]">
        No matches on this flip.
      </div>
    );
  }

  const grouped = assignments.reduce<Record<string, { name: string; units: number }>>((acc, a) => {
    acc[a.playerId] = acc[a.playerId] ?? { name: a.playerName, units: 0 };
    acc[a.playerId].units += a.units;
    return acc;
  }, {});

  return (
    <div className="rounded-2xl bg-[var(--rtb-accent-panel)] px-4 py-3.5 ring-1 ring-[var(--rtb-border-strong)]">
      <p className="mb-2.5 text-[0.60rem] font-black uppercase tracking-[0.22em] text-[var(--rtb-accent)]">
        Match
      </p>
      <div className="space-y-2">
        {Object.entries(grouped).map(([playerId, summary]) => (
          <div key={playerId} className="flex items-center justify-between">
            <span className="font-bold text-[var(--rtb-text)]">{summary.name}</span>
            <span className="text-sm font-semibold text-[var(--rtb-text-muted)]">Give {summary.units}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
