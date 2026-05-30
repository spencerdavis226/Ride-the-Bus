import { useEffect, useMemo, useState } from 'react';
import { useGame } from '../../app/GameProvider';
import type { GameLogEntry, GameLogPhase } from '../../game/log';
import {
  getDefaultHistoryFilter,
  summarizeDrinkTotals,
  summarizeTableHits,
  tableHitCountLabel,
  tableHitLine,
  type DrinkTotal
} from '../../game/log';
import { Drawer } from '../common/Drawer';

const filters: Array<{ id: GameLogPhase; label: string }> = [
  { id: 'deal', label: 'Deal' },
  { id: 'table', label: 'Table' },
  { id: 'bus', label: 'Bus' }
];

export function HistoryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useGame();
  const defaultFilter = getDefaultHistoryFilter(state.phase, state.gameOverReason);
  const defaultPhaseFilter = defaultFilter === 'all' ? 'deal' : defaultFilter;
  const [filter, setFilter] = useState<GameLogPhase>(defaultPhaseFilter);
  const summaryEntries = useMemo(
    () => state.log.filter((entry) => entry.kind === filter),
    [filter, state.log]
  );
  const totals = useMemo(() => summarizeDrinkTotals(summaryEntries), [summaryEntries]);
  const entries = useMemo(
    () => state.log
      .filter((entry) => entry.kind === filter)
      .filter(isTimelineEntry)
      .slice()
      .reverse(),
    [filter, state.log]
  );
  const showSummary = filter === 'deal' || filter === 'bus';

  useEffect(() => {
    if (open) {
      setFilter(defaultPhaseFilter);
    }
  }, [defaultPhaseFilter, open]);

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
    <section className="rounded-2xl bg-[var(--rtb-accent-panel)] p-3 ring-1 ring-[var(--rtb-border-strong)]">
      <p className="px-1 text-[0.62rem] font-black uppercase tracking-[0.22em] text-[var(--rtb-accent)]">
        {title}
      </p>
      {totals.length === 0 ? (
        <p className="mt-2 rounded-xl bg-[var(--rtb-surface-soft)] px-4 py-4 text-center text-xl font-black text-[var(--rtb-text)]">
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
    <div className="flex min-h-[4.1rem] items-center justify-between gap-3 rounded-xl bg-[var(--rtb-surface-soft)] px-4 py-3 ring-1 ring-[var(--rtb-border)]">
      <span className="min-w-0 truncate text-[clamp(1.05rem,4.8vw,1.45rem)] font-black text-[var(--rtb-text)]">
        {total.playerName}
      </span>
      <span className="shrink-0 text-right">
        <span className={`block text-[clamp(1.15rem,5vw,1.65rem)] font-black leading-tight ${total.take > 0 ? 'text-[var(--rtb-warning)]' : 'text-[var(--rtb-success)]'}`}>
          {primary}
        </span>
        {secondary && <span className="block text-xs font-black uppercase tracking-[0.12em] text-[var(--rtb-text-muted)]">{secondary}</span>}
      </span>
    </div>
  );
}

function PhaseFilters({ active, onChange }: { active: GameLogPhase; onChange: (filter: GameLogPhase) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="History phase">
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
                ? 'bg-[var(--rtb-accent)] text-[var(--rtb-accent-text)]'
                : 'bg-[var(--rtb-surface-soft)] text-[var(--rtb-text-muted)] ring-1 ring-[var(--rtb-border)] active:bg-[var(--rtb-surface-strong)]'
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

function Timeline({ filter, entries }: { filter: GameLogPhase; entries: GameLogEntry[] }) {
  if (entries.length === 0) {
    return <p className="rounded-xl bg-[var(--rtb-surface-soft)] p-4 text-center text-sm font-bold text-[var(--rtb-text-muted)]">Nothing here yet.</p>;
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
  const tableHero = entry.kind === 'table' ? detail ?? entry.cardLabel ?? title : null;
  const showTableEmpty = entry.kind === 'table' && !hasDrinks;
  const showTitle = entry.kind !== 'table' || (!detail && !showTableEmpty);

  return (
    <li
      className={`rounded-xl px-3 py-2.5 ring-1 ${quiet ? 'bg-[var(--rtb-surface-soft)] ring-[var(--rtb-border)]' : 'bg-[var(--rtb-accent-panel)] ring-[var(--rtb-border-strong)]'}`}
    >
      {entry.result && entry.result !== 'neutral' && (
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-[0.16em] ${entry.result === 'correct' ? 'bg-[var(--rtb-accent-soft)] text-[var(--rtb-success)]' : 'bg-[var(--rtb-accent-soft)] text-[var(--rtb-danger)]'}`}>
            {entry.result}
          </span>
        </div>
      )}
      {tableHero && <p className="history-table-hero">{tableHero}</p>}
      {showTableEmpty && <p className="history-table-empty">{title}</p>}
      {showTitle && (
        <p className={`${quiet ? 'text-sm text-[var(--rtb-text-muted)]' : 'text-[0.95rem] font-black text-[var(--rtb-text)]'} leading-snug`}>
          {title}
        </p>
      )}
      {showTableHits && <TableHitRows entry={entry} />}
      {detail && entry.kind !== 'table' && <p className="mt-0.5 text-sm font-semibold leading-snug text-[var(--rtb-text-muted)]">{detail}</p>}
    </li>
  );
}

function isTimelineEntry(entry: GameLogEntry) {
  const hasAssignments = Boolean(entry.assignments?.length);
  if (hasAssignments || entry.cardLabel || entry.result === 'correct' || entry.result === 'wrong') {
    return true;
  }
  return entry.result !== 'neutral';
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
