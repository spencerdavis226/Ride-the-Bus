import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useGame } from '../../app/GameProvider';
import type { DealSubphase } from '../../game/phases';
import { springs, sceneEntryVariants } from '../../lib/motion';
import { PlayingCard } from '../cards/PlayingCard';
import { Button } from '../common/Button';
import { Drawer } from '../common/Drawer';
import { LogDrawer } from '../log/LogDrawer';
import {
  HandPreviewOverlay,
  PlayerTurnRail,
  PlayActionZone,
  PlayFelt,
  PlayGuessPicker,
  PlayScreen,
  PlayTopBar,
} from '../play/PlayLayout';

const phaseLabels = ['Red or Black', 'Higher or Lower', 'Inside or Outside', 'Suit'];

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
            className="deal-turn-content flex h-full min-h-0 flex-col gap-[clamp(0.5rem,2.4vh,1rem)] p-[clamp(0.9rem,3vw,1.5rem)] landscape-xs:grid landscape-xs:grid-cols-[minmax(9rem,28vw)_minmax(0,1fr)] landscape-xs:grid-rows-[minmax(0,1fr)] landscape-xs:items-center landscape-xs:gap-[clamp(0.75rem,2vw,1.25rem)] landscape-xs:px-[0.9rem] landscape-xs:py-[0.75rem]"
            variants={sceneEntryVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={springs.sceneEntry}
          >
            <div className="deal-hero shrink-0 landscape-xs:grid landscape-xs:gap-[0.35rem] landscape-xs:min-w-0 landscape-xs:self-center">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-gold/65">
                {phaseLabels[progressIndex]} {progressIndex + 1} of 4
              </p>
              <h2 className="deal-player-name max-w-full truncate pb-[0.08em] text-[clamp(3.1rem,14vw,7.5rem)] font-black leading-[0.95] tracking-tight text-cream sm:text-[clamp(4rem,10vw,8rem)] landscape-xs:whitespace-normal landscape-xs:text-[clamp(1.9rem,5.8vw,3.2rem)]">
                The Bus
              </h2>
              <BusStatus
                drinksEach={bus.drinksEach}
                mode={state.settings.busMode === 'endless' ? 'Endless' : 'Single deck'}
                riderNames={riderNames}
                reshuffles={bus.reshuffleCount}
              />
            </div>

            <div className="deal-stage min-h-0 flex-1 landscape-xs:h-full landscape-xs:min-h-0 landscape-xs:max-h-none">
              <BusCardsStage progressIndex={progressIndex} visibleCards={bus.visibleCards} />
            </div>

            <BusResult label={bus.lastAssignment?.label ?? null} />
          </motion.div>
        </AnimatePresence>
      </PlayFelt>

      <PlayActionZone>
        <PlayGuessPicker
          subphase={activeSubphase}
          onGuess={(guess) => dispatch({ type: 'BUS_GUESS', guess })}
        />
      </PlayActionZone>

      <LogDrawer open={logOpen} onClose={() => setLogOpen(false)} />
      <AnimatePresence>
        {previewPlayer && (
          <HandPreviewOverlay player={previewPlayer} onClose={() => setPreviewPlayerId(null)} />
        )}
      </AnimatePresence>
      <Drawer open={quitOpen} title="Go Home" onClose={() => setQuitOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm leading-6 text-cream/72">
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
        <div className="space-y-4 text-sm leading-6 text-cream/72">
          <p>Guess all four bus cards in order to escape.</p>
          <p>A wrong guess sends riders back to the start and adds drinks to each rider.</p>
          <p>The Bus uses its own fresh deck. Endless mode reshuffles when needed.</p>
          <p className="text-gold">Aces are high, except on September 1st.</p>
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
  return (
    <div className="mt-2 flex max-w-full flex-wrap items-center gap-2">
      <span className="max-w-full truncate rounded-xl bg-black/20 px-3 py-2 text-[clamp(0.9rem,3vw,1.05rem)] font-black text-cream/88 ring-1 ring-white/[0.06]">
        {riderNames}
      </span>
      <span className="rounded-xl bg-gold px-3 py-2 text-[clamp(0.85rem,2.7vw,1rem)] font-black text-ink">
        {drinksEach} each
      </span>
      <span className="rounded-xl bg-white/[0.07] px-3 py-2 text-[clamp(0.78rem,2.5vw,0.92rem)] font-black text-cream/58 ring-1 ring-white/[0.07]">
        {mode}
        {reshuffles > 0 ? ` · ${reshuffles} reshuffle${reshuffles === 1 ? '' : 's'}` : ''}
      </span>
    </div>
  );
}

function BusCardsStage({
  progressIndex,
  visibleCards,
}: {
  progressIndex: number;
  visibleCards: Parameters<typeof PlayingCard>[0]['card'][];
}) {
  return (
    <div className="bus-cards-stage flex h-full min-h-0 items-center justify-center overflow-hidden">
      <div className="grid h-full max-h-[min(100%,25rem)] w-full max-w-[58rem] grid-cols-4 items-center gap-[clamp(0.45rem,2.2vw,1rem)]">
        {visibleCards.map((card, index) => (
          <motion.div
            key={card?.id ?? `empty-${index}`}
            className="grid aspect-[5/7] min-h-0 place-items-center"
            initial={{ y: 12, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: index === progressIndex ? 1 : 0.92 }}
            transition={{ ...springs.guessPicker, delay: index * 0.03 }}
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
    return (
      <div className="rounded-2xl bg-black/18 px-4 py-3 text-sm font-bold text-cream/48 ring-1 ring-white/[0.06]">
        Guess the highlighted card to keep moving.
      </div>
    );
  }

  return (
    <motion.div
      className="rounded-2xl bg-gold/[0.10] px-4 py-3 ring-1 ring-gold/20"
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
      <p className="mb-1 text-[0.58rem] font-black uppercase tracking-[0.22em] text-gold/75">
        Last miss
      </p>
      <p className="text-sm font-black text-cream">{label}</p>
    </motion.div>
  );
}
