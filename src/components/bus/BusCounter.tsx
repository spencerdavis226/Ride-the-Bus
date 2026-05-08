import { cansForDrinks } from '../../game/rules';

export function BusCounter({ drinksEach, riderCount }: { drinksEach: number; riderCount: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-black/[0.28] px-4 py-3 ring-1 ring-[#f5d99b]/18">
      <div>
        <p className="text-[0.60rem] font-black uppercase tracking-[0.2em] text-[#f5d99b]/65">
          Each rider owes
        </p>
        <p className="mt-0.5 text-[1.85rem] font-black leading-none text-[#fff7e6]">{drinksEach}</p>
        <p className="mt-0.5 text-xs text-[#fff7e6]/45">drinks</p>
      </div>
      <div className="text-right">
        <p className="text-[0.60rem] font-black uppercase tracking-[0.2em] text-[#f5d99b]/65">
          Cans each
        </p>
        <p className="mt-0.5 text-[1.85rem] font-black leading-none text-[#fff7e6]">
          {cansForDrinks(drinksEach)}
        </p>
        {riderCount > 1 && (
          <p className="mt-0.5 text-xs text-[#fff7e6]/45">{drinksEach * riderCount} group total</p>
        )}
      </div>
    </div>
  );
}
