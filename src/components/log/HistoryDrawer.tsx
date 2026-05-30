import { useEffect, useMemo, useState } from 'react';
import { useGame } from '../../app/GameProvider';
import type { GameLogEntry, HistoryFilter } from '../../game/log';
import {
  getDefaultHistoryFilter,
  summarizeDrinkTotals,
  summarizeTableHits,
  tableHitCountLabel,
  tableHitLine,
  type DrinkTotal
} from '../../game/log';
import { Drawer } from '../common/Drawer';

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
      {open ? (
        <>
          {showSummary ? (
            <DrinkSummary title={filter === 'deal' ? 'Deal drinks' : 'Bus total'} totals={totals} />
          ) : null}
          <PhaseFilters active={filter} onChange={setFilter} />
          <Timeline filter={filter} entries={entries} />
        </>
      ) : null}
    </Drawer>
  );
}

function DrinkSummary({ title, totals }: { title: string; totals: DrinkTotal[] }) {
  return (
    <section className="rounded-2xl bg-[#f5d99b]/[0.10] p-3 ring-1 ring-[#f5d99b]/20">
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
    </section>
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
    <div className="flex min-h-[4.1rem] items-center justify-between gap-3 rounded-xl bg-black/25 px-4 py-3 ring-1 ring-white/[0.07]">
      <span className="min-w-0 truncate text-[clamp(1.05rem,4.8vw,1.45rem)] font-black text-[#fff7e6]">
        {total.playerName}
      </span>
      <span className="shrink-0 text-right">
        <span className={`block text-[clamp(1.15rem,5vw,1.65rem)] font-black leading-tight ${total.take > 0 ? 'text-[#ffdf8a]' : 'text-[#8ee6a5]'}`}>
          {primary}
        </span>
        {secondary && <span className="block text-xs font-black uppercase tracking-[0.12em] text-[#fff7e6]/48">{secondary}</span>}
      </span>
    </div>
  );
}

function PhaseFilters({ active, onChange }: { active: HistoryFilter; onChange: (filter: HistoryFilter) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2" role="tablist" aria-label="History phase">
      {filters.map((filter) => {
        const selected = active === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(filter.id)}
            className={`min-h-11 rounded-xl text-sm font-black transition-colors ${
              selected
                ? 'bg-[#f5d99b] text-[#142019]'
                : 'bg-white/[0.07] text-[#fff7e6]/68 ring-1 ring-white/[0.07] active:bg-white/[0.12]'
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

function Timeline({ filter, entries }: { filter: HistoryFilter; entries: GameLogEntry[] }) {
  if (entries.length === 0) {
    return <p className="rounded-xl bg-white/[0.05] p-4 text-center text-sm font-bold text-[#fff7e6]/58">Nothing here yet.</p>;
  }

  return (
    <ol key={filter} className="space-y-2">
      {entries.map((entry) => (
        <TimelineEntry key={entry.id} entry={entry} />
      ))}
    </ol>
  );
}

function TimelineEntry({ entry }: { entry: GameLogEntry }) {
  const hasDrinks = Boolean(entry.assignments?.length);
  const quiet = entry.kind === 'system' || !hasDrinks;
  const title = entry.title ?? entry.text;
  const detail = entry.detail && entry.detail !== title ? entry.detail : null;
  const showTableHits = entry.kind === 'table' && Boolean(entry.assignments?.length);

  return (
    <li
      className={`rounded-xl px-3 py-2.5 ring-1 ${quiet ? 'bg-white/[0.045] ring-white/[0.06]' : 'bg-white/[0.09] ring-[#f5d99b]/18'}`}
    >
      <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-black/22 px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-[0.16em] text-[#f5d99b]/72">
          {phaseLabel(entry.kind)}
        </span>
        {entry.result && entry.result !== 'neutral' && (
          <span className={`rounded-full px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-[0.16em] ${entry.result === 'correct' ? 'bg-[#8ee6a5]/15 text-[#8ee6a5]' : 'bg-[#ff7a7a]/15 text-[#ff9b9b]'}`}>
            {entry.result}
          </span>
        )}
      </div>
      <p className={`${quiet ? 'text-sm text-[#fff7e6]/72' : 'text-[0.95rem] font-black text-[#fff7e6]'} leading-snug`}>
        {title}
      </p>
      {showTableHits && <TableHitRows entry={entry} />}
      {detail && <p className="mt-0.5 text-sm font-semibold leading-snug text-[#fff7e6]/52">{detail}</p>}
    </li>
  );
}

function TableHitRows({ entry }: { entry: GameLogEntry }) {
  const summaries = summarizeTableHits(entry.assignments ?? []);
  if (!summaries.length) return null;

  return (
    <div className="history-table-hit-list">
      {summaries.map((summary) => (
        <div key={summary.playerId} className="history-table-hit-row">
          <span className="history-table-hit-name">{tableHitLine(summary)}</span>
          {tableHitCountLabel(summary) && <span className="history-table-hit-count">{tableHitCountLabel(summary)}</span>}
        </div>
      ))}
    </div>
  );
}

function phaseLabel(kind: GameLogEntry['kind']) {
  if (kind === 'deal') return 'Deal';
  if (kind === 'table') return 'Table';
  if (kind === 'bus') return 'Bus';
  return 'Game';
}
