import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useGame } from '../../app/GameProvider';
import type { GameLogEntry, HistoryFilter } from '../../game/log';
import { getDefaultHistoryFilter, summarizeDrinkTotals, type DrinkTotal } from '../../game/log';
import type { DrinkAssignment } from '../../game/state';
import { Drawer } from '../common/Drawer';
import { playFadeTransition, playLayoutTransition } from '../play/PlayLayout';

const filters: Array<{ id: HistoryFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'deal', label: 'Deal' },
  { id: 'table', label: 'Table' },
  { id: 'bus', label: 'Bus' }
];

export function HistoryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useGame();
  const defaultFilter = getDefaultHistoryFilter(state.phase, state.gameOverReason);
  const [filter, setFilter] = useState<HistoryFilter>(defaultFilter);
  const summaryEntries = useMemo(
    () => state.log.filter((entry) => entry.kind === filter),
    [filter, state.log]
  );
  const totals = useMemo(() => summarizeDrinkTotals(summaryEntries), [summaryEntries]);
  const entries = useMemo(
    () => state.log
      .filter((entry) => filter === 'all' || entry.kind === filter)
      .slice()
      .reverse(),
    [filter, state.log]
  );
  const showSummary = filter === 'deal' || filter === 'bus';

  useEffect(() => {
    if (open) {
      setFilter(defaultFilter);
    }
  }, [defaultFilter, open]);

  return (
    <Drawer
      open={open}
      title="History"
      contentClassName="space-y-4"
      contentMaxHeight="min(78dvh, 46rem)"
      onClose={onClose}
    >
      <AnimatePresence initial={false}>
        {showSummary && <DrinkSummary title={filter === 'deal' ? 'Deal drinks' : 'Bus total'} totals={totals} />}
      </AnimatePresence>
      <PhaseFilters active={filter} onChange={setFilter} />
      <Timeline entries={entries} />
    </Drawer>
  );
}

function DrinkSummary({ title, totals }: { title: string; totals: DrinkTotal[] }) {
  return (
    <motion.section
      layout
      className="rounded-2xl bg-[#f5d99b]/[0.10] p-3 ring-1 ring-[#f5d99b]/20"
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={playFadeTransition}
    >
      <p className="px-1 text-[0.62rem] font-black uppercase tracking-[0.22em] text-[#f5d99b]/70">
        {title}
      </p>
      {totals.length === 0 ? (
        <p className="mt-2 rounded-xl bg-black/20 px-4 py-4 text-center text-xl font-black text-[#fff7e6]">
          No drinks yet
        </p>
      ) : (
        <div className="mt-2 grid gap-2">
          {totals.map((total) => (
            <SummaryRow key={total.playerId} total={total} />
          ))}
        </div>
      )}
    </motion.section>
  );
}

function SummaryRow({ total }: { total: DrinkTotal }) {
  const group = total.playerId === 'bus-riders';
  const primary = total.take > 0
    ? group ? `owe ${total.take} each` : `owes ${total.take}`
    : total.give > 0
      ? group ? `give ${total.give}` : `gives ${total.give}`
      : 'even';
  const secondary = total.take > 0 && total.give > 0 ? `${group ? 'give' : 'gives'} ${total.give}` : null;

  return (
    <motion.div layout className="flex min-h-[4.1rem] items-center justify-between gap-3 rounded-xl bg-black/25 px-4 py-3 ring-1 ring-white/[0.07]">
      <span className="min-w-0 truncate text-[clamp(1.05rem,4.8vw,1.45rem)] font-black text-[#fff7e6]">
        {total.playerName}
      </span>
      <span className="shrink-0 text-right">
        <span className={`block text-[clamp(1.15rem,5vw,1.65rem)] font-black leading-tight ${total.take > 0 ? 'text-[#ffdf8a]' : 'text-[#8ee6a5]'}`}>
          {primary}
        </span>
        {secondary && <span className="block text-xs font-black uppercase tracking-[0.12em] text-[#fff7e6]/48">{secondary}</span>}
      </span>
    </motion.div>
  );
}

function PhaseFilters({ active, onChange }: { active: HistoryFilter; onChange: (filter: HistoryFilter) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2" role="tablist" aria-label="History phase">
      {filters.map((filter) => {
        const selected = active === filter.id;
        return (
          <motion.button
            layout
            key={filter.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(filter.id)}
            className={`relative min-h-11 overflow-hidden rounded-xl text-sm font-black transition-colors ${
              selected ? 'text-[#142019]' : 'bg-white/[0.07] text-[#fff7e6]/68 ring-1 ring-white/[0.07] active:bg-white/[0.12]'
            }`}
            transition={playLayoutTransition}
          >
            {selected && (
              <motion.span
                layoutId="history-filter-selection"
                className="absolute inset-0 bg-[#f5d99b]"
                transition={playLayoutTransition}
              />
            )}
            <span className="relative z-10">{filter.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

function Timeline({ entries }: { entries: GameLogEntry[] }) {
  if (entries.length === 0) {
    return <p className="rounded-xl bg-white/[0.05] p-4 text-center text-sm font-bold text-[#fff7e6]/58">Nothing here yet.</p>;
  }

  return (
    <motion.ol layout className="space-y-2">
      <AnimatePresence initial={false}>
        {entries.map((entry) => (
          <TimelineEntry key={entry.id} entry={entry} />
        ))}
      </AnimatePresence>
    </motion.ol>
  );
}

function TimelineEntry({ entry }: { entry: GameLogEntry }) {
  const hasDrinks = Boolean(entry.assignments?.length);
  const quiet = entry.kind === 'system' || !hasDrinks;
  const title = entry.title ?? entry.text;
  const detail = entry.detail && entry.detail !== title ? entry.detail : null;

  return (
    <motion.li
      layout
      className={`rounded-xl p-3 ring-1 ${quiet ? 'bg-white/[0.045] ring-white/[0.06]' : 'bg-white/[0.09] ring-[#f5d99b]/18'}`}
      initial={{ opacity: 0, y: 8, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.985 }}
      transition={playFadeTransition}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-black/22 px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.16em] text-[#f5d99b]/72">
              {phaseLabel(entry.kind)}
            </span>
            {entry.result && entry.result !== 'neutral' && (
              <span className={`rounded-full px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.16em] ${entry.result === 'correct' ? 'bg-[#8ee6a5]/15 text-[#8ee6a5]' : 'bg-[#ff7a7a]/15 text-[#ff9b9b]'}`}>
                {entry.result}
              </span>
            )}
          </div>
          <p className={`${quiet ? 'text-sm text-[#fff7e6]/72' : 'text-base font-black text-[#fff7e6]'} leading-snug`}>
            {title}
          </p>
          {detail && <p className="mt-1 text-sm font-semibold leading-snug text-[#fff7e6]/52">{detail}</p>}
        </div>
      </div>
      {entry.assignments?.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {entry.assignments.map((assignment, index) => (
            <AssignmentPill key={`${assignment.playerId}-${index}`} assignment={assignment} />
          ))}
        </div>
      ) : null}
    </motion.li>
  );
}

function AssignmentPill({ assignment }: { assignment: DrinkAssignment }) {
  const group = assignment.playerId === 'bus-riders';
  const action = assignment.direction === 'take' ? group ? 'owe' : 'owes' : group ? 'give' : 'gives';
  const each = group ? ' each' : '';
  return (
    <span className="rounded-full bg-[#f5d99b]/[0.12] px-2.5 py-1 text-xs font-black text-[#f5d99b]">
      {assignment.playerName} {action} {assignment.units}{each}
    </span>
  );
}

function phaseLabel(kind: GameLogEntry['kind']) {
  if (kind === 'deal') return 'Deal';
  if (kind === 'table') return 'Table';
  if (kind === 'bus') return 'Bus';
  return 'Game';
}
