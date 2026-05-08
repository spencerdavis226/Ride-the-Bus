import { useGame } from '../../app/GameProvider';
import { PlayingCard } from '../cards/PlayingCard';
import { BottomActionBar } from '../layout/BottomActionBar';
import { GuessControls } from '../deal/GuessControls';
import { BusCounter } from './BusCounter';

export function BusScreen() {
  const { state, dispatch } = useGame();
  const bus = state.bus;
  if (!bus) return null;
  const activeSubphase = bus.progressIndex === 0 ? 'redBlack' : bus.progressIndex === 1 ? 'higherLowerSame' : bus.progressIndex === 2 ? 'insideOutsideSame' : 'suit';

  return (
    <section className="flex flex-1 flex-col gap-4">
      <BusCounter drinksEach={bus.drinksEach} riderCount={bus.riders.length} />
      <div className="glass-panel rounded-xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#f5d99b]/75">Card {Math.min(bus.progressIndex + 1, 4)} of 4</p>
            <h2 className="text-2xl font-bold">{bus.riders.map((rider) => rider.name).join(', ')}</h2>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-[#fff7e6]/70">{state.settings.busMode === 'endless' ? 'Endless' : 'Single deck'}</span>
        </div>
        <div className="flex justify-center gap-2">
          {bus.visibleCards.map((card, index) => (
            <PlayingCard key={card?.id ?? `empty-${index}`} card={card} compact faceUp={index < bus.progressIndex} highlighted={index === bus.progressIndex} />
          ))}
        </div>
        {bus.lastAssignment && (
          <div className="mt-4 rounded-xl bg-[#b72e35]/24 p-4 text-center ring-1 ring-[#ff9a9a]/20">
            <span className="font-semibold">{bus.lastAssignment.label}</span>
          </div>
        )}
      </div>
      <BottomActionBar>
        <GuessControls subphase={activeSubphase} onGuess={(guess) => dispatch({ type: 'BUS_GUESS', guess })} />
      </BottomActionBar>
    </section>
  );
}
