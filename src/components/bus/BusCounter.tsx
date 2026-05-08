import { cansForDrinks } from '../../game/rules';

export function BusCounter({ drinksEach, riderCount }: { drinksEach: number; riderCount: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-xl bg-black/[0.24] p-3 ring-1 ring-[#f5d99b]/20">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-[#f5d99b]/70">Each rider owes</p>
        <p className="text-2xl font-bold">{drinksEach} drinks</p>
      </div>
      <div className="text-right">
        <p className="text-xs uppercase tracking-[0.16em] text-[#f5d99b]/70">Cans each</p>
        <p className="text-2xl font-bold">{cansForDrinks(drinksEach)}</p>
        {riderCount > 1 && <p className="text-xs text-[#fff7e6]/55">{drinksEach * riderCount} group total</p>}
      </div>
    </div>
  );
}
