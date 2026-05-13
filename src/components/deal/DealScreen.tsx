import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useGame } from '../../app/GameProvider';
import { suitGlyphs, type Card } from '../../game/cards';
import type { CardBackId, DealResult, DrinkAssignment } from '../../game/state';
import { CardBack } from '../cards/CardBack';
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
          className="deal-turn-content flex h-full min-h-0 flex-col overflow-x-hidden overflow-y-visible p-[clamp(0.9rem,3vw,1.5rem)]"
          initial={{ y: 18, scale: 0.985 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
        >
          <div className="deal-turn-main mx-auto flex h-full w-full max-w-full min-w-0 flex-col gap-[clamp(0.5rem,2.4vh,1rem)]">
            <div className="deal-hero shrink-0">
              <h2 className="deal-player-name max-w-full pb-[0.12em] text-[clamp(2.85rem,12vw,6.2rem)] font-black leading-[1.06] tracking-normal text-[#fff7e6] sm:text-[clamp(3.4rem,8vw,6.7rem)]">
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
              </h2>
              <div className="deal-outcome-slot">
                <AnimatePresence initial={false}>
                  {awaitingContinue && state.deal.lastAssignment && state.deal.lastResult && (
                    <DealOutcome
                      assignment={state.deal.lastAssignment}
                      result={state.deal.lastResult}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="deal-stage grid grid-cols-1 grid-rows-1 overflow-x-hidden overflow-y-visible">
              <ActiveHand cards={player.hand} highlightedIndex={highlightedCardIndex} />
            </div>
          </div>
        </motion.div>
      </PlayFelt>

      <PlayActionZone>
        <AnimatePresence mode="wait">
          {awaitingContinue ? (
            <motion.div
              key="next-btn"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
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
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 290 }}
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
          <p>Deal uses Red/Black, Higher/Lower/Same, Inside/Outside/Same, then Suit. Use Give and Take units.</p>
          <p>The Table flips eleven cards. Matching ranks from player hands autoplay and give the row value.</p>
          <p>The riders with the most cards left ride together. The Bus starts from a fresh single deck.</p>
          <p className="text-[#f5d99b]">Aces are high, except on September 1st.</p>
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
  const reduceMotion = useReducedMotion();
  const correct = result.correct;
  const guessed = formatOutcomeValue(result.guess);
  const action = assignment.direction === 'give' ? 'Give' : 'Take';
  const shellClass = correct
    ? 'border-[#7fd8a3]/45 bg-[#123a2a] text-[#dff8e8] shadow-[0_12px_40px_rgba(47,160,99,0.18)]'
    : 'border-[#f0a0a8]/45 bg-[#481923] text-[#ffe5e8] shadow-[0_12px_40px_rgba(163,38,54,0.20)]';
  const summaryClass = correct
    ? 'bg-[#dff8e8] text-[#123a2a]'
    : 'bg-[#ffe1a8] text-[#34210a]';

  return (
    <motion.div
      className={`deal-outcome inline-flex max-w-[22rem] flex-col items-start gap-2 rounded-xl border px-3 py-2 text-left ${shellClass}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.08 : 0.16, ease: 'easeOut' }}
    >
      <span className={`deal-outcome-summary rounded-lg px-2.5 py-1 text-[clamp(0.95rem,3.4vw,1.15rem)] font-black leading-tight ${summaryClass}`}>
        {correct ? 'Correct!' : 'Wrong!'} {action} {assignment.units}
      </span>
      <span className="deal-outcome-guess min-w-0 text-[clamp(0.9rem,3vw,1.05rem)] font-black leading-tight opacity-90">
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

function computeFan(containerW: number, containerH: number) {
  const N = 4;
  const ASPECT = 5 / 7; // card width / height
  const GAP = Math.max(8, Math.min(18, containerW * 0.02));
  const MAX_CARD_W = 340;
  const MIN_VISIBLE = 0.42; // min fraction visible on non-last cards when overlapping
  const TINY_OVERLAP = 0.88; // if step would be > this fraction of cardW, skip overlap

  let cardW = Math.min(containerH * ASPECT, MAX_CARD_W);

  // No overlap needed?
  if (N * cardW + (N - 1) * GAP <= containerW) {
    return { cardW, cardH: cardW / ASPECT, step: cardW + GAP };
  }

  const idealStep = (containerW - cardW) / (N - 1);

  // Overlap is tiny - shrink cards to fit cleanly without overlap instead
  if (idealStep >= cardW * TINY_OVERLAP) {
    cardW = (containerW - (N - 1) * GAP) / N;
    return { cardW, cardH: cardW / ASPECT, step: cardW + GAP };
  }

  // Real overlap - clamp to MIN_VISIBLE
  if (idealStep >= cardW * MIN_VISIBLE) {
    return { cardW, cardH: cardW / ASPECT, step: idealStep };
  }

  // Overlap too aggressive - shrink cards so MIN_VISIBLE fills the container
  cardW = containerW / (1 + MIN_VISIBLE * (N - 1));
  return { cardW, cardH: cardW / ASPECT, step: cardW * MIN_VISIBLE };
}

function ActiveHand({ cards, highlightedIndex }: { cards: Card[]; highlightedIndex?: number }) {
  const { state } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [tightLandscape, setTightLandscape] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setDims({ w: width, h: height });
      }
    };
    measure();
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setDims({ w: width, h: height });
      }
    });
    obs.observe(el);
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(measure);
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      obs.disconnect();
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(orientation: landscape) and (max-height: 500px) and (max-width: 950px)');
    const sync = () => setTightLandscape(query.matches);

    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const maxHighlightLift = tightLandscape ? 0 : 18;
  const fan = dims.w > 0 && dims.h > 0 ? computeFan(dims.w, Math.max(1, dims.h - maxHighlightLift)) : null;
  const totalFanW = fan ? fan.cardW + fan.step * 3 : 0;
  const highlightLift = fan ? Math.min(maxHighlightLift, fan.cardH * 0.06) : 0;
  const highlightHeadroom = highlightLift + (highlightLift > 0 ? 3 : 0);

  return (
    <div
      ref={containerRef}
      className="deal-hand-frame flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-visible px-[clamp(0.25rem,2vw,1.5rem)] py-[clamp(0.4rem,2vh,1rem)]"
    >
      {fan && (
        <div className="relative flex-shrink-0" style={{ width: totalFanW, height: fan.cardH + highlightHeadroom }}>
          {Array.from({ length: 4 }, (_, i) => {
            const card = cards[i];
            const highlighted = highlightedIndex === i;
            return (
              <motion.div
                key={i}
                className="absolute top-0"
                style={{ left: i * fan.step, top: highlightHeadroom, width: fan.cardW, height: fan.cardH, zIndex: i + (highlighted ? 10 : 0) }}
                initial={false}
                animate={{ y: highlighted ? -highlightLift : 0, scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 340 }}
              >
                <HandSlot
                  key={card?.id ?? `empty-${i}`}
                  backId={state.cardBackId}
                  card={card}
                  highlighted={highlighted}
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HandSlot({
  backId,
  card,
  highlighted,
}: {
  backId: CardBackId;
  card?: Card;
  highlighted: boolean;
}) {
  const reduceMotion = useReducedMotion();

  if (!card) {
    return <CardBack id={backId} size="fluid" />;
  }

  return (
    <motion.div
      className="deal-card-flip"
      initial={{ rotateY: reduceMotion ? 180 : 0 }}
      animate={{ rotateY: 180 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.28, ease: [0.2, 0.75, 0.25, 1] }}
    >
      <div className="deal-card-face">
        <CardBack id={backId} size="fluid" />
      </div>
      <div className="deal-card-face deal-card-front">
        <PlayingCard
          animateEntry={false}
          card={card}
          highlighted={highlighted}
          motionLayout={false}
          size="fluid"
        />
      </div>
    </motion.div>
  );
}
