import { useGame } from '../../app/GameProvider';
import { determineBusRiders } from '../../game/engine';
import { Button } from '../common/Button';
import { BottomActionBar } from '../layout/BottomActionBar';

export function BusIntroScreen() {
  const { state, dispatch } = useGame();
  const riders = determineBusRiders(state.players);
  const plural = riders.length > 1;

  return (
    <section className="flex flex-1 flex-col gap-3">
      <div className="glass-panel rounded-2xl p-5">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-[#f5d99b]/65">
          {plural ? `${riders.length} riders boarding` : 'Boarding the bus'}
        </p>
        <div className="mt-4 space-y-2.5">
          {riders.map((rider) => (
            <div
              key={rider.id}
              className="flex items-center justify-between rounded-2xl bg-[#f5d99b]/[0.08] px-4 py-3.5 ring-1 ring-[#f5d99b]/18"
            >
              <span className="text-xl font-black text-[#fff7e6]">{rider.name}</span>
              <span className="rounded-xl bg-black/30 px-2.5 py-1 text-xs font-black text-[#fff7e6]/60">
                {rider.hand.length} cards
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-[#fff7e6]/50">
          Guess all four cards to escape. A wrong answer sends you back to the start.
        </p>
      </div>
      <BottomActionBar>
        <Button className="w-full text-base" onClick={() => dispatch({ type: 'BUS_START' })}>
          Ride the Bus
        </Button>
      </BottomActionBar>
    </section>
  );
}
