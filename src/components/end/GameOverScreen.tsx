import { motion } from 'framer-motion';
import { useState } from 'react';
import { useGame } from '../../app/GameProvider';
import { Button } from '../common/Button';
import { Drawer } from '../common/Drawer';
import { HistoryDrawer } from '../log/HistoryDrawer';
import { RulesDrawer } from '../rules/RulesDrawer';
import { BusTotals } from '../play/BusTotals';
import { PlayActionZone, PlayFelt, PlayScreen, PlayTopBar, playFadeTransition } from '../play/PlayLayout';
import { ConfettiBurst } from './ConfettiBurst';

export function GameOverScreen() {
  const { state, dispatch } = useGame();
  const [logOpen, setLogOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const bus = state.bus;
  const emptyBus = state.gameOverReason === 'emptyBus';
  const exhausted = state.gameOverReason === 'deckExhausted';
  const escapedViaSame = state.gameOverReason === 'escaped' && Boolean(bus?.escapedViaSame);
  const showConfetti = !exhausted && !emptyBus;

  const title = emptyBus
    ? 'No one rides.'
    : exhausted
      ? 'Deck ran out.'
      : 'They escaped.';
  const subtitle = emptyBus
    ? 'The bus left empty.'
    : exhausted
      ? 'Single-deck bus mode ended the ride early.'
      : escapedViaSame
        ? 'Same was called correctly — riders are off the bus.'
        : 'Four correct guesses in a row.';

  const drinksEach = bus?.drinksEach ?? 0;

  return (
    <PlayScreen className="game-over-screen">
      <PlayTopBar
        onHome={() => setQuitOpen(true)}
        onLog={() => setLogOpen(true)}
        onRules={() => setRulesOpen(true)}
      />

      <PlayFelt className="game-over-felt">
        {showConfetti && <ConfettiBurst />}
        <div className="game-over-stack">
          <motion.div
            className="game-over-copy"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={playFadeTransition}
          >
            <p className="phase-eyebrow text-[0.62rem] font-black uppercase tracking-[0.24em]">
              Game Over
            </p>
            <h2 className="game-over-title">{title}</h2>
            <p className="bus-mode-line game-over-subtitle">{subtitle}</p>
          </motion.div>

          {!emptyBus && (
            <BusTotals animate={false} className="game-over-totals" drinksEach={drinksEach} />
          )}
        </div>
      </PlayFelt>

      <PlayActionZone>
        <div className="grid gap-2">
          <Button className="w-full text-base" style={{ minHeight: '58px' }} onClick={() => dispatch({ type: 'START_GAME' })}>
            Play Again
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => dispatch({ type: 'QUIT_TO_SETUP' })}>
            Quit
          </Button>
        </div>
      </PlayActionZone>

      <HistoryDrawer open={logOpen} onClose={() => setLogOpen(false)} />
      <Drawer open={quitOpen} title="Go Home" onClose={() => setQuitOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm leading-6 text-[var(--rtb-text)] opacity-75">
            Return to setup and clear this run? Your player names and settings will stay ready for the next game.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setQuitOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => dispatch({ type: 'QUIT_TO_SETUP' })}>
              Go Home
            </Button>
          </div>
        </div>
      </Drawer>
      <RulesDrawer open={rulesOpen} scope="context" phase="bus" onClose={() => setRulesOpen(false)} />
    </PlayScreen>
  );
}
