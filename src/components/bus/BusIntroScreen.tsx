import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useGame } from '../../app/GameProvider';
import { determineBusRiders } from '../../game/engine';
import { Button } from '../common/Button';
import { Drawer } from '../common/Drawer';
import { HistoryDrawer } from '../log/HistoryDrawer';
import {
  HandPreviewOverlay,
  PhaseActionBar,
  PhaseHero,
  PlayerTurnRail,
  PlayFelt,
  PlayScreen,
  PlayTopBar,
  ResponsivePlayFrame,
} from '../play/PlayLayout';

export function BusIntroScreen() {
  const { state, dispatch } = useGame();
  const [logOpen, setLogOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const [previewPlayerId, setPreviewPlayerId] = useState<string | null>(null);
  const riders = determineBusRiders(state.players);
  const previewPlayer = previewPlayerId ? riders.find((rider) => rider.id === previewPlayerId) : null;

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
        <motion.div
          className="bus-intro-content h-full min-h-0 p-[clamp(0.9rem,3vw,1.5rem)]"
          initial={{ y: 18, scale: 0.985 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
        >
          <ResponsivePlayFrame
            className="bus-intro-frame"
            hero={(
              <PhaseHero
                eyebrow={riders.length === 1 ? 'Rider' : `${riders.length} riders`}
                title="The Bus"
              />
            )}
            stage={(
              <div className="bus-rider-stage grid h-full min-h-0 content-center gap-2 overflow-y-auto py-1">
                {riders.map((rider, index) => (
                  <motion.button
                    key={rider.id}
                    type="button"
                    onClick={() => setPreviewPlayerId(rider.id)}
                    className="flex min-h-[4.4rem] items-center justify-between rounded-2xl bg-white/[0.06] px-4 text-left ring-1 ring-white/[0.07] transition-colors active:bg-white/[0.11]"
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <span className="min-w-0 truncate text-[clamp(1.15rem,5vw,1.75rem)] font-black text-[#fff7e6]">
                      {rider.name}
                    </span>
                    <span className="shrink-0 rounded-xl bg-[#f5d99b] px-3 py-2 text-sm font-black text-[#142019]">
                      {rider.hand.length} card{rider.hand.length === 1 ? '' : 's'}
                    </span>
                  </motion.button>
                ))}
              </div>
            )}
          />
        </motion.div>
      </PlayFelt>

      <PhaseActionBar>
        <Button className="w-full text-base shadow-none" onClick={() => dispatch({ type: 'BUS_START' })}>
          Ride the Bus
        </Button>
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
          <p>The riders with the most cards left ride the bus.</p>
          <p>Guess all four bus cards in order. A wrong guess adds drinks and restarts progress.</p>
          <p>The Bus starts from a fresh single deck unless endless mode is enabled.</p>
          <p className="text-[#f5d99b]">Aces are high, except on September 1st.</p>
        </div>
      </Drawer>
    </PlayScreen>
  );
}
