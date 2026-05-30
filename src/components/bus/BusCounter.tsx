import { cansForDrinks } from '../../game/rules';

export function BusCounter({ drinksEach, riderCount }: { drinksEach: number; riderCount: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[var(--rtb-surface-soft)] px-4 py-3 ring-1 ring-[var(--rtb-border-strong)]">
      <div>
        <p className="text-[0.60rem] font-black uppercase tracking-[0.2em] text-[var(--rtb-accent)]">
          Each rider owes
        </p>
        <p className="mt-0.5 text-[1.85rem] font-black leading-none text-[var(--rtb-text)]">{drinksEach}</p>
        <p className="mt-0.5 text-xs text-[var(--rtb-text-muted)]">drinks</p>
      </div>
      <div className="text-right">
        <p className="text-[0.60rem] font-black uppercase tracking-[0.2em] text-[var(--rtb-accent)]">
          Cans each
        </p>
        <p className="mt-0.5 text-[1.85rem] font-black leading-none text-[var(--rtb-text)]">
          {cansForDrinks(drinksEach)}
        </p>
        {riderCount > 1 && (
          <p className="mt-0.5 text-xs text-[var(--rtb-text-muted)]">{drinksEach * riderCount} group total</p>
        )}
      </div>
    </div>
  );
}
