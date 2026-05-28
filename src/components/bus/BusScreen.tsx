import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useGame } from '../../app/GameProvider';
import type { DealSubphase } from '../../game/phases';
import { cansForDrinks } from '../../game/rules';
import { Button } from '../common/Button';
import { Drawer } from '../common/Drawer';
import { HistoryDrawer } from '../log/HistoryDrawer';
import { buildBusFanSlots, PlayCardFanArea } from '../play/PlayCardFan';
import {
  HandPreviewOverlay,
  PlayerTurnRail,
  PlayActionSwap,
  PlayActionZone,
  PlayFelt,
  PlayGuessPicker,
  PlayHero,
  PlayOutcomeSlot,
  PlayScreen,
  PlayTopBar,
  PlayTurnFrame,
  PlayTurnMain,
  playFadeTransition,
} from '../play/PlayLayout';

export function BusScreen() {
  const { state, dispatch } = useGame();
  const [logOpen, setLogOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const [previewPlayerId, setPreviewPlayerId] = useState<string | null>(null);
  const bus = state.bus;
  if (!bus) return null;

  const progressIndex = Math.min(bus.progressIndex, 3);
  const activeSubphase = getBusSubphase(progressIndex);
  const previewPlayer = previewPlayerId ? bus.riders.find((rider) => rider.id === previewPlayerId) : null;
  const activeRiderId = bus.riders.length === 1 ? bus.riders[0]?.id : null;
  const justFailed = Boolean(bus.lastAssignment && progressIndex === 0);
  const modeLabel = getBusModeLabel(state.settings.busMode === 'endless', bus.reshuffleCount);
  const slots = buildBusFanSlots(bus.visibleCards, progressIndex);

  return (
    <PlayScreen className="bus-screen">
      <PlayTopBar
        onHome={() => setQuitOpen(true)}
        onLog={() => setLogOpen(true)}
        onRules={() => setRulesOpen(true)}
      />

      <PlayerTurnRail
        players={bus.riders}
        activePlayerId={activeRiderId}
        onPreviewPlayer={(playerId) => setPreviewPlayerId(playerId)}
      />

      <PlayFelt className="bus-felt">
        <PlayTurnFrame className="bus-turn-content">
          <PlayTurnMain className="bus-turn-main">
            <PlayHero className="bus-hero">
              <BusHeader
                drinksEach={bus.drinksEach}
                modeLabel={modeLabel}
                progressIndex={progressIndex}
              />
              <PlayOutcomeSlot className="bus-outcome-slot">
                {justFailed && bus.lastAssignment && <BusOutcome label={bus.lastAssignment.label} />}
              </PlayOutcomeSlot>
            </PlayHero>

            <PlayCardFanArea
              shake={justFailed}
              shakeKey={justFailed ? 'bus-failed' : 'bus-steady'}
              slots={slots}
              stageClassName="bus-stage overflow-visible"
            />
          </PlayTurnMain>
        </PlayTurnFrame>
      </PlayFelt>

      <PlayActionZone>
        <PlayActionSwap actionKey={`bus-guess-${activeSubphase}`}>
          <PlayGuessPicker
            className="bus-guess-picker"
            subphase={activeSubphase}
            onGuess={(guess) => dispatch({ type: 'BUS_GUESS', guess })}
          />
        </PlayActionSwap>
      </PlayActionZone>

      <HistoryDrawer open={logOpen} onClose={() => setLogOpen(false)} />
      <AnimatePresence>
        {previewPlayer && (
          <HandPreviewOverlay player={previewPlayer} onClose={() => setPreviewPlayerId(null)} />
        )}
      </AnimatePresence>
      <Drawer open={quitOpen} title="Go Home" onClose={() => setQuitOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm leading-6 text-[#fff7e6]/72">
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
      <Drawer open={rulesOpen} title="Rules" onClose={() => setRulesOpen(false)}>
        <div className="space-y-4 text-sm leading-6 text-[#fff7e6]/72">
          <p>Guess all four bus cards in order to escape.</p>
          <p>A wrong guess sends riders back to the start and adds drinks to each rider.</p>
          <p>The Bus uses its own fresh deck. Endless mode reshuffles when needed.</p>
          <p className="text-[#f5d99b]">Aces are high, except on September 1st.</p>
        </div>
      </Drawer>
    </PlayScreen>
  );
}

function getBusSubphase(progressIndex: number): DealSubphase {
  if (progressIndex === 0) return 'redBlack';
  if (progressIndex === 1) return 'higherLowerSame';
  if (progressIndex === 2) return 'insideOutsideSame';
  return 'suit';
}

function getBusModeLabel(endless: boolean, reshuffles: number): string | null {
  if (!endless && reshuffles === 0) return null;
  if (reshuffles === 0) return 'Endless';
  return `${endless ? 'Endless' : 'Single deck'} · ${reshuffles} reshuffle${reshuffles === 1 ? '' : 's'}`;
}

function BusHeader({
  drinksEach,
  modeLabel,
  progressIndex,
}: {
  drinksEach: number;
  modeLabel: string | null;
  progressIndex: number;
}) {
  return (
    <motion.div layout className="bus-header-grid">
      <div className="bus-title-block">
        <h2 className="bus-card-title">Card {progressIndex + 1}</h2>
        {modeLabel && <p className="bus-mode-line">{modeLabel}</p>}
      </div>
      <BusTotal drinksEach={drinksEach} />
    </motion.div>
  );
}

function BusTotal({ drinksEach }: { drinksEach: number }) {
  return (
    <motion.div
      key={drinksEach}
      layout
      className="bus-total-stack"
      initial={{ scale: 0.92 }}
      animate={{ scale: 1 }}
      transition={playFadeTransition}
    >
      <div className="bus-total-counter">
        <span className="bus-total-value">{drinksEach}</span>
        <span className="bus-total-label">total</span>
      </div>
      <div className="bus-can-counter" aria-label={`${cansForDrinks(drinksEach)} cans`}>
        <span className="bus-can-value">{cansForDrinks(drinksEach)}</span>
        <span className="bus-can-label">cans</span>
      </div>
    </motion.div>
  );
}

function BusOutcome({ label }: { label: string | null }) {
  if (!label) {
    return null;
  }

  return (
    <div className="deal-outcome bus-outcome inline-flex max-w-full items-center text-left" data-result="wrong">
      <motion.span
        key={label}
        className="deal-outcome-summary bus-outcome-summary text-[clamp(0.95rem,3.4vw,1.15rem)] font-black leading-tight"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...playFadeTransition, duration: 0.12 }}
      >
        Wrong · {label.replace('Riders: ', '')}
      </motion.span>
    </div>
  );
}

