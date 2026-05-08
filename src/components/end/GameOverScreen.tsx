import { useGame } from '../../app/GameProvider';
import { cansForDrinks } from '../../game/rules';
import { Button } from '../common/Button';
import { BottomActionBar } from '../layout/BottomActionBar';
import { ConfettiBurst } from './ConfettiBurst';

export function GameOverScreen() {
  const { state, dispatch } = useGame();
  const bus = state.bus;
  const emptyBus = state.gameOverReason === 'emptyBus';
  const exhausted = state.gameOverReason === 'deckExhausted';

  const title = emptyBus
    ? 'No one rides.'
    : exhausted
      ? 'Deck ran out.'
      : 'They escaped.';
  const subtitle = emptyBus
    ? 'The bus left empty.'
    : exhausted
      ? 'Single-deck bus mode ended the ride early.'
      : 'Four correct guesses in a row.';

  const drinksEach = bus?.drinksEach ?? 0;

  return (
    <section className="relative flex flex-1 flex-col gap-4">
      {!exhausted && <ConfettiBurst />}

      <div className="glass-panel mt-6 rounded-2xl p-6 text-center">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.26em] text-[#f5d99b]/65">
          Game Over
        </p>
        <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-[#fff7e6]">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#fff7e6]/55">{subtitle}</p>

        {!emptyBus && (
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-black/[0.28] p-4 ring-1 ring-white/[0.07]">
            <div>
              <p className="text-[0.60rem] font-black uppercase tracking-[0.2em] text-[#f5d99b]/65">
                Drinks each
              </p>
              <p className="mt-1 text-3xl font-black text-[#fff7e6]">{drinksEach}</p>
            </div>
            <div>
              <p className="text-[0.60rem] font-black uppercase tracking-[0.2em] text-[#f5d99b]/65">
                Cans each
              </p>
              <p className="mt-1 text-3xl font-black text-[#fff7e6]">{cansForDrinks(drinksEach)}</p>
            </div>
          </div>
        )}
      </div>

      <BottomActionBar>
        <Button
          className="w-full text-base"
          onClick={() => dispatch({ type: 'START_GAME' })}
        >
          Play Again
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => dispatch({ type: 'OPEN_NEW_GAME_FROM_EXISTING_PLAYERS' })}
        >
          Modify Players
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => dispatch({ type: 'QUIT_TO_SETUP' })}
        >
          Quit
        </Button>
      </BottomActionBar>
    </section>
  );
}
