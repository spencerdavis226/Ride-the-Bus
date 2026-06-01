import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { useGame } from '../../app/GameProvider';
import type { DealResult, DrinkAssignment } from '../../game/state';
import { Button } from '../common/Button';
import { Drawer } from '../common/Drawer';
import { HistoryDrawer } from '../log/HistoryDrawer';
import { RulesDrawer } from '../rules/RulesDrawer';
import { buildDealFanSlots, PlayCardFanArea } from '../play/PlayCardFan';
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
} from '../play/PlayLayout';

export function DealScreen() {
  const { state, dispatch } = useGame();
  const [logOpen, setLogOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const [previewPlayerId, setPreviewPlayerId] = useState<string | null>(null);
  const player = state.players[state.deal.playerIndex];
  const previewPlayer = previewPlayerId ? state.players.find((candidate) => candidate.id === previewPlayerId) : null;
  const awaitingContinue = state.deal.awaitingContinue;
  const highlightedCardIndex = awaitingContinue ? player.hand.length - 1 : undefined;
  const turnKey = player.id;
  const slots = buildDealFanSlots(player.hand, {
    highlightedIndex: highlightedCardIndex,
    slotLabel: (index, card) =>
      card ? `${player.name} card ${index + 1}, revealed` : `${player.name} card ${index + 1}, hidden`,
  });

  return (
    <PlayScreen className="deal-layout">
      <PlayTopBar
        onHome={() => setQuitOpen(true)}
        onLog={() => setLogOpen(true)}
        onRules={() => setRulesOpen(true)}
      />

      <PlayerTurnRail
        players={state.players}
        activePlayerId={player.id}
        onPreviewPlayer={(playerId) => setPreviewPlayerId(playerId)}
      />

      <PlayFelt>
        <PlayTurnFrame>
          <PlayTurnMain>
            <PlayHero>
              <PlayTitle>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={turnKey}
                    className="block truncate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.14, ease: 'easeOut' }}
                  >
                    {player.name}
                  </motion.span>
                </AnimatePresence>
              </PlayTitle>
              <PlayOutcomeSlot>
                <AnimatePresence initial={false} mode="sync">
                  {awaitingContinue && state.deal.lastAssignment && state.deal.lastResult && (
                    <DealOutcome
                      key={`${state.deal.lastResult.actual}-${state.deal.lastAssignment.units}`}
                      assignment={state.deal.lastAssignment}
                      result={state.deal.lastResult}
                    />
                  )}
                </AnimatePresence>
              </PlayOutcomeSlot>
            </PlayHero>

            <PlayCardFanArea liftHighlighted={false} slots={slots} />
          </PlayTurnMain>
        </PlayTurnFrame>
      </PlayFelt>

      <PlayActionZone>
        <PlayActionSwap actionKey={awaitingContinue ? 'continue' : `guess-${player.id}-${state.deal.subphase}`}>
          {awaitingContinue ? (
            <Button
              className="w-full text-base"
              style={{ minHeight: '58px' }}
              onClick={() => dispatch({ type: 'DEAL_CONTINUE' })}
            >
              Next
            </Button>
          ) : (
            <PlayGuessPicker
              subphase={state.deal.subphase}
              onGuess={(guess) => dispatch({ type: 'DEAL_GUESS', guess })}
            />
          )}
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
      <RulesDrawer open={rulesOpen} scope="context" phase="deal" onClose={() => setRulesOpen(false)} />
    </PlayScreen>
  );
}

function DealOutcome({
  assignment,
  result,
}: {
  assignment: DrinkAssignment;
  result: DealResult;
}) {
  const reduceMotion = useReducedMotion();
  const correct = result.correct;
  const action = assignment.direction === 'give' ? 'Give' : 'Take';

  return (
    <motion.div
      layout
      className="deal-outcome inline-flex max-w-[22rem] items-center text-left"
      data-result={correct ? 'correct' : 'wrong'}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: reduceMotion ? 0.08 : 0.16, ease: 'easeOut' }}
    >
      <span className="deal-outcome-summary text-[clamp(0.95rem,3.4vw,1.15rem)] font-black leading-tight">
        {correct ? 'Correct' : 'Wrong'} · {action} {assignment.units}
      </span>
    </motion.div>
  );
}
