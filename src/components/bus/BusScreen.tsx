import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { useGame } from '../../app/GameProvider';
import type { Card } from '../../game/cards';
import { dealSubphaseLabels, type DealSubphase } from '../../game/phases';
import type { Player } from '../../game/state';
import { PlayingCard } from '../cards/PlayingCard';
import { Button } from '../common/Button';
import { Drawer } from '../common/Drawer';
import { HistoryDrawer } from '../log/HistoryDrawer';
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
  PlayTitle,
  PlayTopBar,
  PlayTurnFrame,
  PlayTurnMain,
  playFadeTransition,
  playLayoutTransition,
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
  const riderTitle = formatRiderTitle(bus.riders);
  const justFailed = Boolean(bus.lastAssignment && progressIndex === 0);
  const modeLabel = getBusModeLabel(state.settings.busMode === 'endless', bus.reshuffleCount);

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
              <PlayTitle>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={riderTitle}
                    className="block truncate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.14, ease: 'easeOut' }}
                  >
                    {riderTitle}
                  </motion.span>
                </AnimatePresence>
              </PlayTitle>
              <BusStatus
                drinksEach={bus.drinksEach}
                modeLabel={modeLabel}
                progressIndex={progressIndex}
                reset={justFailed}
                subphase={activeSubphase}
              />
              <PlayOutcomeSlot className="bus-outcome-slot">
                <AnimatePresence initial={false} mode="sync">
                  {justFailed && bus.lastAssignment && (
                    <BusOutcome
                      key={`${bus.lastAssignment.units}-${bus.drinksEach}`}
                      drinksEach={bus.drinksEach}
                      label={bus.lastAssignment.label}
                    />
                  )}
                </AnimatePresence>
              </PlayOutcomeSlot>
            </PlayHero>

            <motion.div layout className="deal-stage bus-stage grid min-h-0 flex-1 grid-cols-1 grid-rows-1 overflow-visible">
              <BusCardsStage
                failed={justFailed}
                progressIndex={progressIndex}
                visibleCards={bus.visibleCards}
              />
            </motion.div>
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

function formatRiderTitle(riders: Player[]): string {
  if (riders.length === 1) return riders[0]?.name ?? 'Rider';
  if (riders.length === 2) return riders.map((rider) => rider.name).join(' + ');
  return `${riders.length} riders`;
}

function getBusModeLabel(endless: boolean, reshuffles: number): string | null {
  if (!endless && reshuffles === 0) return null;
  if (reshuffles === 0) return 'Endless';
  return `${endless ? 'Endless' : 'Single deck'} · ${reshuffles} reshuffle${reshuffles === 1 ? '' : 's'}`;
}

function getBusPrompt(subphase: DealSubphase): string {
  if (subphase === 'redBlack') return 'Guess Red / Black';
  if (subphase === 'higherLowerSame') return 'Guess Higher / Lower / Same';
  if (subphase === 'insideOutsideSame') return 'Guess Inside / Outside / Same';
  return 'Guess the Suit';
}

function BusStatus({
  drinksEach,
  modeLabel,
  progressIndex,
  reset,
  subphase,
}: {
  drinksEach: number;
  modeLabel: string | null;
  progressIndex: number;
  reset: boolean;
  subphase: DealSubphase;
}) {
  return (
    <motion.div layout className="bus-status-grid">
      <div className="bus-command-copy">
        <p className="bus-progress-line">
          {reset ? 'Back to Card 1' : `Card ${progressIndex + 1} of 4`}
          <span aria-hidden="true"> · </span>
          {dealSubphaseLabels[subphase]}
        </p>
        <p className="bus-instruction-line">{getBusPrompt(subphase)}</p>
        {modeLabel && <p className="bus-mode-line">{modeLabel}</p>}
      </div>
      <motion.div
        key={drinksEach}
        layout
        className="bus-total-counter"
        initial={{ scale: 0.92 }}
        animate={{ scale: 1 }}
        transition={playFadeTransition}
      >
        <span className="bus-total-value">{drinksEach}</span>
        <span className="bus-total-label">each</span>
      </motion.div>
    </motion.div>
  );
}

function BusOutcome({ drinksEach, label }: { drinksEach: number; label: string | null }) {
  if (!label) {
    return null;
  }

  return (
    <motion.div
      layout
      className="deal-outcome bus-outcome inline-flex max-w-full items-center text-left"
      data-result="wrong"
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={playFadeTransition}
    >
      <span className="deal-outcome-summary bus-outcome-summary text-[clamp(0.95rem,3.4vw,1.15rem)] font-black leading-tight">
        Wrong · {label.replace('Riders: ', '')} · {drinksEach} each total
      </span>
    </motion.div>
  );
}

function BusCardsStage({
  failed,
  progressIndex,
  visibleCards,
}: {
  failed: boolean;
  progressIndex: number;
  visibleCards: Array<Card | null>;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="bus-cards-stage grid h-full min-h-0 place-items-center">
      <motion.div
        key={failed ? 'bus-failed' : 'bus-steady'}
        layout
        className="bus-card-runway grid h-full w-full max-w-[58rem] grid-cols-4 items-center justify-items-center gap-[clamp(0.45rem,2.2vw,1rem)]"
        initial={failed && !reduceMotion ? { x: 0 } : false}
        animate={failed && !reduceMotion ? { x: [0, -7, 7, -4, 4, 0] } : { x: 0 }}
        transition={failed && !reduceMotion ? { duration: 0.34, ease: 'easeOut' } : playLayoutTransition}
      >
        {visibleCards.map((card, index) => (
          <BusCardSlot
            key={card?.id ?? `empty-${index}`}
            card={card}
            index={index}
            progressIndex={progressIndex}
            reduceMotion={Boolean(reduceMotion)}
          />
        ))}
      </motion.div>
    </div>
  );
}

function BusCardSlot({
  card,
  index,
  progressIndex,
  reduceMotion,
}: {
  card: Card | null;
  index: number;
  progressIndex: number;
  reduceMotion: boolean;
}) {
  const revealed = index < progressIndex;
  const current = index === progressIndex;
  const stateClass = revealed ? 'is-revealed' : current ? 'is-current' : 'is-future';

  return (
    <motion.div
      layout
      aria-label={getBusSlotLabel(index, progressIndex, card)}
      className={`bus-card-slot ${stateClass} grid shrink-0 place-items-center`}
      initial={reduceMotion ? false : { y: 12, opacity: 0, scale: 0.94 }}
      animate={{ y: 0, opacity: index > progressIndex ? 0.58 : 1, scale: current ? 1 : 0.92 }}
      transition={reduceMotion ? { duration: 0.01 } : { type: 'spring', damping: 24, stiffness: 270, delay: index * 0.03 }}
    >
      <PlayingCard
        card={card}
        faceUp={revealed}
        highlighted={current}
        size="fluid"
      />
    </motion.div>
  );
}

function getBusSlotLabel(index: number, progressIndex: number, card: Card | null) {
  const slot = `Bus card ${index + 1}`;
  if (index < progressIndex && card) return `${slot}, revealed`;
  if (index === progressIndex) return `${slot}, current card`;
  return `${slot}, hidden`;
}
