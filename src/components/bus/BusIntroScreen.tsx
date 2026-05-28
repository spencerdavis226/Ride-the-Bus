import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useGame } from '../../app/GameProvider';
import { determineBusRiders } from '../../game/engine';
import type { Player } from '../../game/state';
import { Button } from '../common/Button';
import { Drawer } from '../common/Drawer';
import { HistoryDrawer } from '../log/HistoryDrawer';
import {
  HandPreviewOverlay,
  PlayerTurnRail,
  PlayActionSwap,
  PlayActionZone,
  PlayFelt,
  PlayHero,
  PlayOutcomeSlot,
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
  const previewPlayer = previewPlayerId ? riders.find((rider) => rider.id === previewPlayerId) : null;
  const riderTitle = formatIntroTitle(riders);

  return (
    <PlayScreen className="bus-intro-screen">
      <PlayTopBar
        onHome={() => setQuitOpen(true)}
        onLog={() => setLogOpen(true)}
        onRules={() => setRulesOpen(true)}
      />

      <PlayerTurnRail
        players={riders}
        activePlayerId={riders.length === 1 ? riders[0]?.id : null}
        onPreviewPlayer={(playerId) => setPreviewPlayerId(playerId)}
      />

      <PlayFelt className="bus-felt">
        <PlayTurnFrame className="bus-intro-content">
          <PlayTurnMain className="bus-intro-main">
            <PlayHero className="bus-intro-hero">
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
              <p className="bus-intro-command">Most cards left · Ride together</p>
              <PlayOutcomeSlot className="bus-intro-outcome-slot">
                <span className="bus-intro-note">
                  Guess four cards in a row. A miss adds drinks and sends riders back to Card 1.
                </span>
              </PlayOutcomeSlot>
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
          <p>The riders with the most cards left ride the bus.</p>
          <p>Guess all four bus cards in order. A wrong guess adds drinks and restarts progress.</p>
          <p>The Bus starts from a fresh single deck unless endless mode is enabled.</p>
          <p className="text-[#f5d99b]">Aces are high, except on September 1st.</p>
        </div>
      </Drawer>
    </PlayScreen>
  );
}

function formatIntroTitle(riders: Player[]): string {
  if (riders.length === 1) return riders[0]?.name ?? 'Rider';
  if (riders.length === 2) return riders.map((rider) => rider.name).join(' + ');
  return `${riders.length} riders`;
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
      className="bus-rider-row flex min-h-[4.4rem] items-center justify-between rounded-2xl bg-white/[0.06] px-4 text-left ring-1 ring-white/[0.07] transition-colors active:bg-white/[0.11]"
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...playFadeTransition, delay: index * 0.04 }}
    >
      <span className="min-w-0 truncate text-[clamp(1.15rem,5vw,1.75rem)] font-black text-[#fff7e6]">
        {rider.name}
      </span>
      <span className="shrink-0 rounded-xl bg-[#f5d99b] px-3 py-2 text-sm font-black text-[#142019]">
        {rider.hand.length} card{rider.hand.length === 1 ? '' : 's'}
      </span>
    </motion.button>
  );
}
