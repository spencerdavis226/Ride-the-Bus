import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useGame } from '../../app/GameProvider';
import { determineBusRiders } from '../../game/engine';
import { springs, sceneEntryVariants } from '../../lib/motion';
import { Button } from '../common/Button';
import { Drawer } from '../common/Drawer';
import { LogDrawer } from '../log/LogDrawer';
import {
  HandPreviewOverlay,
  PlayerTurnRail,
  PlayActionZone,
  PlayFelt,
  PlayScreen,
  PlayTopBar,
} from '../play/PlayLayout';

export function BusIntroScreen() {
  const { state, dispatch } = useGame();
  const [logOpen, setLogOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const [previewPlayerId, setPreviewPlayerId] = useState<string | null>(null);
  const riders = determineBusRiders(state.players);
  const previewPlayer = previewPlayerId ? riders.find((rider) => rider.id === previewPlayerId) : null;
  const plural = riders.length > 1;

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
          className="deal-turn-content flex h-full min-h-0 flex-col gap-[clamp(0.5rem,2.4vh,1rem)] p-[clamp(0.9rem,3vw,1.5rem)] landscape-xs:grid landscape-xs:grid-cols-[minmax(9rem,28vw)_minmax(0,1fr)] landscape-xs:grid-rows-[minmax(0,1fr)] landscape-xs:items-center landscape-xs:gap-[clamp(0.75rem,2vw,1.25rem)] landscape-xs:px-[0.9rem] landscape-xs:py-[0.75rem]"
          variants={sceneEntryVariants}
          initial="hidden"
          animate="visible"
          transition={springs.sceneEntry}
        >
          <div className="deal-hero shrink-0 landscape-xs:grid landscape-xs:gap-[0.35rem] landscape-xs:min-w-0 landscape-xs:self-center">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-gold/65">
              {plural ? `${riders.length} riders boarding` : 'Boarding the bus'}
            </p>
            <h2 className="deal-player-name max-w-full truncate pb-[0.08em] text-[clamp(3.1rem,14vw,7.5rem)] font-black leading-[0.95] tracking-tight text-cream sm:text-[clamp(4rem,10vw,8rem)] landscape-xs:whitespace-normal landscape-xs:text-[clamp(1.9rem,5.8vw,3.2rem)]">
              The Bus
            </h2>
          </div>

          <div className="deal-stage min-h-0 flex-1 landscape-xs:h-full landscape-xs:min-h-0 landscape-xs:max-h-none">
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
                  <span className="min-w-0 truncate text-[clamp(1.15rem,5vw,1.75rem)] font-black text-cream">
                    {rider.name}
                  </span>
                  <span className="shrink-0 rounded-xl bg-gold px-3 py-2 text-sm font-black text-ink">
                    {rider.hand.length} card{rider.hand.length === 1 ? '' : 's'}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-black/18 px-4 py-3 text-sm font-bold text-cream/58 ring-1 ring-white/[0.06]">
            Guess all four cards to escape. A miss sends riders back to the start.
          </div>
        </motion.div>
      </PlayFelt>

      <PlayActionZone>
        <Button className="w-full text-base shadow-none" onClick={() => dispatch({ type: 'BUS_START' })}>
          Ride the Bus
        </Button>
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
          <p>The riders with the most cards left ride the bus.</p>
          <p>Guess all four bus cards in order. A wrong guess adds drinks and restarts progress.</p>
          <p>The Bus starts from a fresh single deck unless endless mode is enabled.</p>
          <p className="text-gold">Aces are high, except on September 1st.</p>
        </div>
      </Drawer>
    </PlayScreen>
  );
}
