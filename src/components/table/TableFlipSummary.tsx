import type { DrinkAssignment } from '../../game/state';

export function TableFlipSummary({ assignments }: { assignments: DrinkAssignment[] }) {
  if (!assignments.length) {
    return <div className="rounded-xl bg-white/[0.08] p-4 text-sm text-[#fff7e6]/68">No matches on this flip.</div>;
  }
  const grouped = assignments.reduce<Record<string, { name: string; units: number }>>((acc, assignment) => {
    acc[assignment.playerId] = acc[assignment.playerId] ?? { name: assignment.playerName, units: 0 };
    acc[assignment.playerId].units += assignment.units;
    return acc;
  }, {});
  return (
    <div className="rounded-xl bg-white/[0.08] p-4">
      <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[#f5d99b]/70">Assignments</p>
      <div className="space-y-2">
        {Object.entries(grouped).map(([playerId, summary]) => (
          <div key={playerId} className="flex items-center justify-between">
            <span className="font-semibold text-[#fff7e6]">{summary.name}</span>
            <span className="text-[#fff7e6]/72">Give {summary.units}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
