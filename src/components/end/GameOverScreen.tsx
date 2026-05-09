import { motion } from 'framer-motion';
import { useGame } from '../../app/GameProvider';
import { cansForDrinks } from '../../game/rules';
import { useMotion } from '../../lib/motion';
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
  const { sceneEntry, springs } = useMotion();

  return (
    <section className="relative flex flex-1 flex-col gap-4">
      {!exhausted && <ConfettiBurst />}

      <motion.div
        className="glass-panel mt-6 rounded-2xl p-6 text-center"
        variants={sceneEntry}
        initial="hidden"
        animate="visible"
        transition={springs.sceneEntry}
      >
        <p className="text-[0.62rem] font-black uppercase tracking-[0.26em] text-gold/65">
          Game Over
        </p>
        <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-cream">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-cream/55">{subtitle}</p>

        {!emptyBus && (
          <motion.div
            className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-black/[0.28] p-4 ring-1 ring-white/[0.07]"
            variants={sceneEntry}
            initial="hidden"
            animate="visible"
            transition={{ ...springs.sceneEntry, delay: 0.12 }}
          >
            <div>
              <p className="text-[0.60rem] font-black uppercase tracking-[0.2em] text-gold/65">
                Drinks each
              </p>
              <p className="mt-1 text-3xl font-black text-cream">{drinksEach}</p>
            </div>
            <div>
              <p className="text-[0.60rem] font-black uppercase tracking-[0.2em] text-gold/65">
                Cans each
              </p>
              <p className="mt-1 text-3xl font-black text-cream">{cansForDrinks(drinksEach)}</p>
            </div>
          </motion.div>
        )}
      </motion.div>

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
