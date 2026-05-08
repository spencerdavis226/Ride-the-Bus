import { useGame } from '../../app/GameProvider';
import { determineBusRiders } from '../../game/engine';
import { Button } from '../common/Button';
import { BottomActionBar } from '../layout/BottomActionBar';

export function BusIntroScreen() {
  const { state, dispatch } = useGame();
  const riders = determineBusRiders(state.players);
  return (
    <section className="flex flex-1 flex-col gap-4">
      <div className="glass-panel rounded-xl p-5">
        <p className="text-sm text-[#f5d99b]/75">Bus riders</p>
        <div className="mt-4 space-y-3">
          {riders.map((rider) => (
            <div key={rider.id} className="flex items-center justify-between rounded-xl bg-white/[0.08] p-4">
              <span className="text-xl font-bold">{rider.name}</span>
              <span className="text-sm text-[#fff7e6]/60">{rider.hand.length} cards</span>
            </div>
          ))}
        </div>
      </div>
      <BottomActionBar>
        <Button onClick={() => dispatch({ type: 'BUS_START' })}>Ride the Bus</Button>
      </BottomActionBar>
    </section>
  );
}
