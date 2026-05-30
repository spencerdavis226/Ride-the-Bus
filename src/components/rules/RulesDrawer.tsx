import {
  ArrowUpDown,
  Check,
  ChevronRight,
  Layers,
  RotateCcw,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Drawer } from '../common/Drawer';
import {
  aceFootnote,
  dealSteps,
  rulesByPhase,
  rulesPhaseEyebrows,
  rulesPhaseLabels,
  rulesPhases,
  type RulesPhase,
  type RulesScope,
} from './rulesContent';

const ruleIcons: Record<RulesPhase, LucideIcon[]> = {
  deal: [Check, ArrowUpDown],
  table: [Layers, Sparkles, Users],
  bus: [Check, Sparkles, RotateCcw],
};

export function RulesDrawer({
  open,
  onClose,
  scope,
  phase = 'deal',
}: {
  open: boolean;
  onClose: () => void;
  scope: RulesScope;
  phase?: RulesPhase;
}) {
  const [activePhase, setActivePhase] = useState<RulesPhase>(phase);

  useEffect(() => {
    if (open) {
      setActivePhase(scope === 'context' ? phase : 'deal');
    }
  }, [open, phase, scope]);

  const displayPhase = scope === 'context' ? phase : activePhase;

  return (
    <Drawer
      open={open}
      title="Rules"
      contentClassName="space-y-4"
      contentMaxHeight={scope === 'full' ? 'min(78dvh, 46rem)' : '62dvh'}
      onClose={onClose}
    >
      {open ? (
        <>
          {scope === 'full' ? (
            <>
              <GameFlowStrip />
              <PhaseTabs active={activePhase} onChange={setActivePhase} />
            </>
          ) : null}
          <RulesPhaseContent phase={displayPhase} showStepper={displayPhase === 'deal'} />
          <AceFootnote />
        </>
      ) : null}
    </Drawer>
  );
}

function GameFlowStrip() {
  const steps: Array<{ id: RulesPhase; label: string }> = [
    { id: 'deal', label: 'Deal' },
    { id: 'table', label: 'Table' },
    { id: 'bus', label: 'Bus' },
  ];

  return (
    <div className="flex items-center justify-center gap-1.5 px-1" aria-hidden="true">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-1.5">
          <span className="rounded-full bg-[var(--rtb-surface-soft)] px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.14em] text-[var(--rtb-text-muted)] ring-1 ring-[var(--rtb-border)]">
            {step.label}
          </span>
          {index < steps.length - 1 ? (
            <span className="flex h-6 w-4 shrink-0 items-center justify-center text-[var(--rtb-accent)] opacity-55" aria-hidden="true">
              <ChevronRight size={12} strokeWidth={2.75} />
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function PhaseTabs({
  active,
  onChange,
}: {
  active: RulesPhase;
  onChange: (phase: RulesPhase) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Rules phase">
      {rulesPhases.map((id) => {
        const selected = active === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(id)}
            className={`min-h-11 rounded-xl text-sm font-black transition-colors ${
              selected
                ? 'bg-[var(--rtb-accent)] text-[var(--rtb-accent-text)]'
                : 'bg-[var(--rtb-surface-soft)] text-[var(--rtb-text-muted)] ring-1 ring-[var(--rtb-border)] active:bg-[var(--rtb-surface-strong)]'
            }`}
          >
            {rulesPhaseLabels[id]}
          </button>
        );
      })}
    </div>
  );
}

function RulesPhaseContent({
  phase,
  showStepper,
}: {
  phase: RulesPhase;
  showStepper: boolean;
}) {
  const content = rulesByPhase[phase];
  const icons = ruleIcons[phase];

  return (
    <section className="rounded-2xl bg-[var(--rtb-accent-panel)] p-3 ring-1 ring-[var(--rtb-border-strong)]">
      <p className="px-1 text-[0.62rem] font-black uppercase tracking-[0.22em] text-[var(--rtb-accent)]">
        {rulesPhaseEyebrows[phase]}
      </p>
      <p className="mt-2 px-1 text-[clamp(1.05rem,4.5vw,1.35rem)] font-black leading-snug text-[var(--rtb-text)]">
        {content.goal}
      </p>
      {showStepper ? <DealStepper /> : null}
      <ul className="mt-3 grid gap-2">
        {content.rules.map((rule, index) => (
          <RuleCard key={rule.text} icon={icons[index] ?? Check} text={rule.text} />
        ))}
      </ul>
    </section>
  );
}

function DealStepper() {
  return (
    <ol
      className="rules-stepper mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-1.5"
      aria-label="Deal card order"
    >
      {dealSteps.map(({ step, lines }) => (
        <li
          key={step}
          className="flex min-h-[4.5rem] flex-col rounded-xl bg-[var(--rtb-surface-soft)] px-2 py-2.5 text-center ring-1 ring-[var(--rtb-border)]"
        >
          <span className="flex h-5 shrink-0 items-center justify-center">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--rtb-accent-soft)] text-[0.62rem] font-black text-[var(--rtb-accent)]">
              {step}
            </span>
          </span>
          <span className="flex flex-1 flex-col items-center justify-center gap-0.5">
            {lines.map((line) => (
              <span key={line} className="text-[0.6rem] font-bold leading-tight text-[var(--rtb-text-muted)]">
                {line}
              </span>
            ))}
          </span>
        </li>
      ))}
    </ol>
  );
}

function RuleCard({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <li className="flex min-h-[2.75rem] items-center gap-3 rounded-xl bg-[var(--rtb-surface-soft)] px-3 py-2.5 ring-1 ring-[var(--rtb-border)]">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--rtb-accent-soft)] text-[var(--rtb-accent)]">
        <Icon size={16} strokeWidth={2.25} />
      </span>
      <p className="text-sm font-semibold leading-snug text-[var(--rtb-text)]">{text}</p>
    </li>
  );
}

function AceFootnote() {
  return (
    <p className="rounded-xl bg-[var(--rtb-accent-panel)] px-3.5 py-2.5 text-center text-sm font-semibold leading-snug text-[var(--rtb-accent)] ring-1 ring-[var(--rtb-border-strong)]">
      {aceFootnote}
    </p>
  );
}
