import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { useGame } from '../../app/GameProvider';
import type { Card } from '../../game/cards';
import type { DealSubphase } from '../../game/phases';
import { PlayingCard } from '../cards/PlayingCard';
import { Button } from '../common/Button';
import { Drawer } from '../common/Drawer';
import { HistoryDrawer } from '../log/HistoryDrawer';
import {
  HandPreviewOverlay,
  PhaseActionBar,
  PhaseHero,
  PlayerTurnRail,
  PlayFelt,
  PlayGuessPicker,
  PlayScreen,
  PlayTopBar,
  ResponsivePlayFrame,
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
  const riderNames = bus.riders.map((rider) => rider.name).join(', ');

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
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`bus-${progressIndex}-${bus.drinksEach}`}
            className="bus-turn-content h-full min-h-0 p-[clamp(0.9rem,3vw,1.5rem)]"
            initial={{ y: 18, scale: 0.985 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -14, scale: 0.985 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          >
            <ResponsivePlayFrame
              className="bus-play-frame"
              hero={(
                <PhaseHero eyebrow={`${progressIndex + 1}/4`} title="The Bus">
                  <BusStatus
                    drinksEach={bus.drinksEach}
                    mode={state.settings.busMode === 'endless' ? 'Endless' : 'Single deck'}
                    riderNames={riderNames}
                    reshuffles={bus.reshuffleCount}
                  />
                </PhaseHero>
              )}
              stage={(
                <BusCardsStage progressIndex={progressIndex} visibleCards={bus.visibleCards} />
              )}
              result={bus.lastAssignment ? <BusResult label={bus.lastAssignment.label} /> : undefined}
            />
          </motion.div>
        </AnimatePresence>
      </PlayFelt>

      <PhaseActionBar>
        <PlayGuessPicker
          className="bus-guess-picker"
          subphase={activeSubphase}
          onGuess={(guess) => dispatch({ type: 'BUS_GUESS', guess })}
        />
      </PhaseActionBar>

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

function BusStatus({
  drinksEach,
  mode,
  riderNames,
  reshuffles,
}: {
  drinksEach: number;
  mode: string;
  riderNames: string;
  reshuffles: number;
}) {
  const showMode = mode !== 'Single deck' || reshuffles > 0;

  return (
    <div className="bus-status mt-2 flex max-w-full flex-wrap items-center gap-2">
      <span className="bus-status-riders max-w-full truncate rounded-xl bg-black/20 px-3 py-2 text-[clamp(0.9rem,3vw,1.05rem)] font-black text-[#fff7e6]/88 ring-1 ring-white/[0.06]">
        {riderNames}
      </span>
      <span className="bus-status-total rounded-xl bg-[#f5d99b] px-3 py-2 text-[clamp(0.85rem,2.7vw,1rem)] font-black text-[#142019]">
        {drinksEach} each
      </span>
      {showMode && (
        <span className="bus-status-mode rounded-xl bg-white/[0.07] px-3 py-2 text-[clamp(0.78rem,2.5vw,0.92rem)] font-black text-[#fff7e6]/58 ring-1 ring-white/[0.07]">
          {mode}
          {reshuffles > 0 ? ` · ${reshuffles} reshuffle${reshuffles === 1 ? '' : 's'}` : ''}
        </span>
      )}
    </div>
  );
}

function BusCardsStage({
  progressIndex,
  visibleCards,
}: {
  progressIndex: number;
  visibleCards: Array<Card | null>;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="bus-cards-stage grid h-full min-h-0 place-items-center">
      <div className="bus-card-runway grid h-full w-full max-w-[58rem] grid-cols-4 items-center justify-items-center gap-[clamp(0.45rem,2.2vw,1rem)]">
        {visibleCards.map((card, index) => (
          <motion.div
            key={card?.id ?? `empty-${index}`}
            className="bus-card-slot grid shrink-0 place-items-center"
            initial={reduceMotion ? false : { y: 12, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: index === progressIndex ? 1 : 0.92 }}
            transition={reduceMotion ? { duration: 0.01 } : { type: 'spring', damping: 24, stiffness: 270, delay: index * 0.03 }}
          >
            <PlayingCard
              card={card}
              faceUp={index < progressIndex}
              highlighted={index === progressIndex}
              size="fluid"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function BusResult({ label }: { label: string | null }) {
  if (!label) {
    return null;
  }

  return (
    <motion.div
      className="bus-result-card rounded-2xl bg-[#f5d99b]/[0.10] px-4 py-3 ring-1 ring-[#f5d99b]/20"
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
      <p className="text-sm font-black text-[#fff7e6]">{label}</p>
    </motion.div>
  );
}
