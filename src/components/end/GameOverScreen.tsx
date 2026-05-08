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
  const title = emptyBus ? 'No one rides.' : exhausted ? 'The deck ran out.' : 'The riders escaped.';
  const subtitle = emptyBus
    ? 'The bus left empty.'
    : exhausted
      ? 'Single-deck bus mode stopped before the riders escaped.'
      : 'Four correct guesses in a row.';
  const drinksEach = bus?.drinksEach ?? 0;

  return (
    <section className="relative flex flex-1 flex-col gap-4">
      {!exhausted && <ConfettiBurst />}
      <div className="glass-panel mt-8 rounded-xl p-6 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-[#f5d99b]/70">Game Over</p>
        <h2 className="mt-3 text-4xl font-bold">{title}</h2>
        <p className="mt-2 text-[#fff7e6]/68">{subtitle}</p>
        {!emptyBus && (
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-black/[0.24] p-4">
            <div>
              <p className="text-xs text-[#f5d99b]/70">Drinks each</p>
              <p className="text-3xl font-bold">{drinksEach}</p>
            </div>
            <div>
              <p className="text-xs text-[#f5d99b]/70">Cans each</p>
              <p className="text-3xl font-bold">{cansForDrinks(drinksEach)}</p>
            </div>
          </div>
        )}
      </div>
      <BottomActionBar>
        <Button onClick={() => dispatch({ type: 'START_GAME' })}>Play Again</Button>
        <Button variant="secondary" onClick={() => dispatch({ type: 'OPEN_NEW_GAME_FROM_EXISTING_PLAYERS' })}>
          Modify Players
        </Button>
        <Button variant="ghost" onClick={() => dispatch({ type: 'QUIT_TO_SETUP' })}>
          Quit
        </Button>
      </BottomActionBar>
    </section>
  );
}
