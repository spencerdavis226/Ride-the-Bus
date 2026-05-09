import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useGame } from '../../app/GameProvider';
import { suitGlyphs } from '../../game/cards';
import type { DealResult, DrinkAssignment } from '../../game/state';
import { useMotion } from '../../lib/motion';
import { CardFanLayout } from '../cards/CardFanLayout';
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
  const { sceneEntry, actionZone, springs } = useMotion();

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
        <motion.div
          className="deal-turn-content flex h-full min-h-0 flex-col overflow-x-hidden overflow-y-visible p-[clamp(0.9rem,3vw,1.5rem)] landscape-xs:grid landscape-xs:grid-cols-[minmax(9rem,28vw)_minmax(0,1fr)] landscape-xs:grid-rows-[minmax(0,1fr)] landscape-xs:items-center landscape-xs:gap-[clamp(0.75rem,2vw,1.25rem)] landscape-xs:px-[0.9rem] landscape-xs:py-[0.75rem]"
          variants={sceneEntry}
          initial="hidden"
          animate="visible"
          transition={springs.sceneEntry}
        >
          <div className="deal-turn-main mx-auto mt-auto mb-auto flex w-full max-w-full min-w-0 flex-col gap-[clamp(0.5rem,2.4vh,1rem)] landscape-xs:contents">
            <div className="deal-hero shrink-0 landscape-xs:grid landscape-xs:gap-[0.35rem] landscape-xs:min-w-0 landscape-xs:self-center">
              <h2 className="deal-player-name max-w-full truncate pb-[0.08em] text-[clamp(3.1rem,14vw,7.5rem)] font-black leading-[0.95] tracking-tight text-cream sm:text-[clamp(4rem,10vw,8rem)] landscape-xs:whitespace-normal landscape-xs:text-[clamp(1.9rem,5.8vw,3.2rem)]">
                {player.name}
              </h2>
              <AnimatePresence>
                {awaitingContinue && state.deal.lastAssignment && state.deal.lastResult && (
                  <DealOutcome
                    assignment={state.deal.lastAssignment}
                    result={state.deal.lastResult}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="deal-stage grid grid-cols-1 grid-rows-1 overflow-x-hidden overflow-y-visible landscape-xs:h-full landscape-xs:min-h-0 landscape-xs:max-h-none">
              <CardFanLayout
                cards={player.hand}
                cardBackId={state.cardBackId}
                highlightedIndex={highlightedCardIndex}
              />
            </div>
          </div>
        </motion.div>
      </PlayFelt>

      <PlayActionZone>
        <AnimatePresence mode="popLayout">
          {awaitingContinue ? (
            <motion.div
              key="next-btn"
              variants={actionZone}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.15 }}
            >
              <Button
                className="w-full text-base"
                style={{ minHeight: '58px' }}
                onClick={() => dispatch({ type: 'DEAL_CONTINUE' })}
              >
                Next
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={`guess-btns-${player.id}-${state.deal.subphase}`}
              variants={actionZone}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={springs.guessPicker}
            >
              <PlayGuessPicker
                subphase={state.deal.subphase}
                onGuess={(guess) => dispatch({ type: 'DEAL_GUESS', guess })}
              />
            </motion.div>
          )}
        </AnimatePresence>
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
          <p>Deal uses Red/Black, Higher/Lower/Same, Inside/Outside/Same, then Suit. Use Give and Take units.</p>
          <p>The Table flips eleven cards. Matching ranks from player hands autoplay and give the row value.</p>
          <p>The riders with the most cards left ride together. The Bus starts from a fresh single deck.</p>
          <p className="text-gold">Aces are high, except on September 1st.</p>
        </div>
      </Drawer>
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
  const { dealOutcome, springs } = useMotion();
  const correct = result.correct;
  const guessed = formatOutcomeValue(result.guess);
  const action = assignment.direction === 'give' ? 'Give' : 'Take';
  const shellClass = correct
    ? 'border-correct-border/45 bg-correct-bg text-correct-text shadow-deal-correct'
    : 'border-wrong-border/45 bg-wrong-bg text-wrong-text shadow-deal-wrong';
  const summaryClass = correct
    ? 'bg-correct-text text-correct-bg'
    : 'bg-wrong-summary-bg text-wrong-summary-text';
  const variants = correct ? dealOutcome.correct : dealOutcome.wrong;
  const transition = correct
    ? springs.overlay
    : { duration: 0.35 };

  return (
    <motion.div
      className={`deal-outcome mt-2 inline-grid max-w-[22rem] gap-2 rounded-xl border px-3 py-2 landscape-xs:justify-self-start landscape-xs:max-w-[min(100%,18rem)] landscape-xs:gap-[0.45rem] landscape-xs:px-[0.75rem] landscape-xs:py-[0.65rem] ${shellClass}`}
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={transition}
    >
      <span className={`deal-outcome-summary justify-self-start rounded-lg px-2.5 py-1 text-[clamp(0.95rem,3.4vw,1.15rem)] font-black leading-tight landscape-xs:text-[clamp(0.9rem,2.35vw,1.05rem)] landscape-xs:px-[0.65rem] landscape-xs:py-[0.4rem] ${summaryClass}`}>
        {correct ? 'Correct!' : 'Wrong!'} {action} {assignment.units}
      </span>
      <span className="deal-outcome-guess min-w-0 text-[clamp(0.9rem,3vw,1.05rem)] font-black leading-tight opacity-90 landscape-xs:text-[clamp(0.82rem,2.1vw,0.98rem)]">
        Your guess: {guessed}
      </span>
    </motion.div>
  );
}

function formatOutcomeValue(value: string): string {
  if (value === 'spades' || value === 'hearts' || value === 'diamonds' || value === 'clubs') {
    return suitGlyphs[value];
  }
  return `${value[0]?.toUpperCase() ?? ''}${value.slice(1)}`;
}
