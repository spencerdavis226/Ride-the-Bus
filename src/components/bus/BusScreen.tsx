import { useGame } from '../../app/GameProvider';
import { GuessControls } from '../deal/GuessControls';
import { PlayingCard } from '../cards/PlayingCard';
import { BottomActionBar } from '../layout/BottomActionBar';
import { BusCounter } from './BusCounter';

const phaseLabels = ['Red or Black?', 'Higher or Lower?', 'Inside or Outside?', 'Which Suit?'];

export function BusScreen() {
  const { state, dispatch } = useGame();
  const bus = state.bus;
  if (!bus) return null;

  const progressIndex = Math.min(bus.progressIndex, 3);
  const activeSubphase =
    progressIndex === 0
      ? 'redBlack'
      : progressIndex === 1
        ? 'higherLowerSame'
        : progressIndex === 2
          ? 'insideOutsideSame'
          : 'suit';

  return (
    <section className="flex flex-1 flex-col gap-3">
      <BusCounter drinksEach={bus.drinksEach} riderCount={bus.riders.length} />

      <div className="glass-panel rounded-2xl p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-[#f5d99b]/65">
              {phaseLabels[progressIndex]}
            </p>
            <h2 className="mt-0.5 truncate text-2xl font-black leading-tight text-[#fff7e6]">
              {bus.riders.map((r) => r.name).join(', ')}
            </h2>
          </div>
          <span className="mt-0.5 shrink-0 rounded-xl bg-white/[0.08] px-3 py-1.5 text-xs font-bold text-[#fff7e6]/60 ring-1 ring-white/[0.07]">
            {state.settings.busMode === 'endless' ? 'Endless' : 'Single deck'}
          </span>
        </div>

        <div className="flex justify-center gap-3">
          {bus.visibleCards.map((card, index) => (
            <PlayingCard
              key={card?.id ?? `empty-${index}`}
              card={card}
              faceUp={index < bus.progressIndex}
              highlighted={index === bus.progressIndex}
              size="normal"
            />
          ))}
        </div>

        {bus.lastAssignment && (
          <div className="mt-4 rounded-2xl bg-[#f5d99b] px-4 py-3 text-center shadow-glow">
            <span className="text-base font-black text-[#142019]">{bus.lastAssignment.label}</span>
          </div>
        )}
      </div>

      <BottomActionBar>
        <GuessControls
          subphase={activeSubphase}
          onGuess={(guess) => dispatch({ type: 'BUS_GUESS', guess })}
        />
      </BottomActionBar>
    </section>
  );
}
