import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useGame } from '../../app/GameProvider';
import { determineBusRiders } from '../../game/engine';
import type { Player } from '../../game/state';
import { Button } from '../common/Button';
import { Drawer } from '../common/Drawer';
import { HistoryDrawer } from '../log/HistoryDrawer';
import { RulesDrawer } from '../rules/RulesDrawer';
import {
  HandPreviewOverlay,
  PlayerTurnRail,
  PlayActionSwap,
  PlayActionZone,
  PlayFelt,
  PlayHero,
  PlayScreen,
  PlayTitle,
  PlayTopBar,
  PlayTurnFrame,
  PlayTurnMain,
  playFadeTransition,
} from '../play/PlayLayout';

export function BusIntroScreen() {
  const { state, dispatch } = useGame();
  const [logOpen, setLogOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const [previewPlayerId, setPreviewPlayerId] = useState<string | null>(null);
  const riders = determineBusRiders(state.players);
  const previewPlayer = previewPlayerId ? state.players.find((player) => player.id === previewPlayerId) : null;
  const riderTitle = formatIntroTitle(riders.length);
  const riderIds = riders.map((rider) => rider.id);

  return (
    <PlayScreen className="bus-intro-screen">
      <PlayTopBar
        onHome={() => setQuitOpen(true)}
        onLog={() => setLogOpen(true)}
        onRules={() => setRulesOpen(true)}
      />

      <PlayerTurnRail
        activePlayerIds={riderIds}
        players={state.players}
        onPreviewPlayer={(playerId) => setPreviewPlayerId(playerId)}
      />

      <PlayFelt className="bus-felt">
        <PlayTurnFrame className="bus-intro-content">
          <PlayTurnMain className="bus-intro-main">
            <PlayHero className="bus-intro-hero shrink-0">
              <PlayTitle className="bus-intro-title">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={riderTitle}
                    className="block"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.14, ease: 'easeOut' }}
                  >
                    {riderTitle}
                  </motion.span>
                </AnimatePresence>
              </PlayTitle>
            </PlayHero>

            <motion.div layout className="deal-stage bus-rider-stage grid min-h-0 flex-1 grid-cols-1 grid-rows-1 overflow-hidden">
              <div className="bus-rider-list grid content-center gap-2 overflow-y-auto py-1">
                {riders.map((rider, index) => (
                  <BusRiderRow
                    key={rider.id}
                    index={index}
                    rider={rider}
                    onPreview={() => setPreviewPlayerId(rider.id)}
                  />
                ))}
              </div>
            </motion.div>
          </PlayTurnMain>
        </PlayTurnFrame>
      </PlayFelt>

      <PlayActionZone>
        <PlayActionSwap actionKey="ride-the-bus">
          <Button className="w-full text-base shadow-none" onClick={() => dispatch({ type: 'BUS_START' })}>
            Ride the Bus
          </Button>
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

function formatIntroTitle(count: number): string {
  return `${count} Bus Rider${count === 1 ? '' : 's'}`;
}

function BusRiderRow({
  index,
  onPreview,
  rider,
}: {
  index: number;
  onPreview: () => void;
  rider: Player;
}) {
  return (
    <motion.button
      layout
      type="button"
      onClick={onPreview}
      className="bus-rider-row flex min-h-[4.4rem] items-center justify-between rounded-2xl bg-[var(--rtb-surface-soft)] px-4 text-left ring-1 ring-[var(--rtb-border)] transition-colors active:bg-[var(--rtb-surface-strong)]"
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...playFadeTransition, delay: index * 0.04 }}
    >
      <span className="min-w-0 truncate text-[clamp(1.15rem,5vw,1.75rem)] font-black text-[var(--rtb-text)]">
        {rider.name}
      </span>
      <span className="shrink-0 rounded-xl bg-[var(--rtb-accent)] px-3 py-2 text-sm font-black text-[var(--rtb-accent-text)]">
        {rider.hand.length} card{rider.hand.length === 1 ? '' : 's'}
      </span>
    </motion.button>
  );
}
