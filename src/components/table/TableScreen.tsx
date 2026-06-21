import { AnimatePresence, motion, useReducedMotion, type Transition } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { useGame } from '../../app/GameProvider';
import { suitGlyphs } from '../../game/cards';
import { summarizeTableHits, tableHitCountLabel, tableHitLine } from '../../game/log';
import type { CardBackId, TableCard } from '../../game/state';
import { CardBack } from '../cards/CardBack';
import { PlayingCard } from '../cards/PlayingCard';
import { Button } from '../common/Button';
import { Drawer } from '../common/Drawer';
import { IconButton } from '../common/IconButton';
import { HistoryDrawer } from '../log/HistoryDrawer';
import { RulesDrawer } from '../rules/RulesDrawer';
import {
  HandPreviewOverlay,
  PlayerTurnRail,
  PlayActionSwap,
  PlayActionZone,
  PlayFelt,
  PlayScreen,
  PlayTopBar,
  playFadeTransition,
  playLayoutTransition,
} from '../play/PlayLayout';

export function TableScreen() {
  const { state, dispatch } = useGame();
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const [tableHitsOpen, setTableHitsOpen] = useState(false);
  const [previewPlayerId, setPreviewPlayerId] = useState<string | null>(null);
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);
  const [cardTransition, setCardTransition] = useState<'next' | 'none'>('none');
  const previewPlayer = previewPlayerId ? state.players.find((candidate) => candidate.id === previewPlayerId) : null;
  const total = state.table.cards.length;
  const focusIndex = reviewIndex ?? (state.table.completed ? total - 1 : state.table.activeIndex);
  const focusCard = state.table.cards[focusIndex] ?? null;
  const reviewingFlip = reviewIndex !== null || state.table.completed;
  const buttonProgress = `${Math.min(focusIndex + 1, total)}/${total}`;

  function flipCurrentCard() {
    if (!focusCard || reviewingFlip) return;
    setCardTransition('none');
    setReviewIndex(state.table.activeIndex);
    dispatch({ type: 'TABLE_FLIP_NEXT' });
  }

  function moveToNextCard() {
    if (state.table.completed) {
      dispatch({ type: 'TABLE_CONTINUE' });
      return;
    }

    setCardTransition('next');
    setReviewIndex(null);
  }

  return (
    <PlayScreen className="table-screen">
      <PlayTopBar
        onHome={() => setQuitOpen(true)}
        onLog={() => setLogOpen(true)}
        onRules={() => setRulesOpen(true)}
        rightActions={(
          <IconButton ghost label="Table view" onClick={() => setOverviewOpen(true)}>
            <LayoutGrid size={21} strokeWidth={2.25} />
          </IconButton>
        )}
      />

      <PlayerTurnRail
        players={state.players}
        activePlayerId={null}
        onPreviewPlayer={(playerId) => setPreviewPlayerId(playerId)}
      />

      <PlayFelt className="table-felt">
        <motion.div
          layout
          className="table-turn-content deal-turn-content relative flex h-full min-h-0 flex-col overflow-hidden p-[clamp(0.9rem,3vw,1.5rem)]"
          initial={{ y: 18, scale: 0.985 }}
          animate={{ y: 0, scale: 1 }}
          transition={playLayoutTransition}
        >
          <motion.div layout className="deal-turn-main table-turn-main mx-auto mb-auto mt-auto flex h-full w-full max-w-full min-w-0 flex-col gap-[clamp(0.5rem,2.4vh,1rem)]">
            <motion.div layout className="deal-hero table-hero shrink-0">
              <TableHero card={focusCard} />
              <div className="deal-outcome-slot table-outcome-slot">
                {focusCard && <TableResult card={focusCard} revealed={reviewingFlip} onViewAll={() => setTableHitsOpen(true)} />}
              </div>
            </motion.div>

            <motion.div layout className="deal-stage table-stage grid min-h-0 flex-1 grid-cols-1 grid-rows-1 overflow-visible">
              <TableCardFocus card={focusCard} cardBackId={state.cardBackId} transitionDirection={cardTransition} />
            </motion.div>
          </motion.div>
        </motion.div>
      </PlayFelt>

      <PlayActionZone>
        <PlayActionSwap actionKey={reviewingFlip ? 'next-table-card' : `flip-table-card-${buttonProgress}`}>
          {reviewingFlip ? (
            <Button
              className="w-full text-base shadow-none"
              onClick={moveToNextCard}
              disabled={!state.table.completed && !state.table.cards[state.table.activeIndex]}
            >
              {state.table.completed ? 'Next' : 'Next Card'}
            </Button>
          ) : (
            <Button
              className="w-full text-base shadow-none"
              onClick={flipCurrentCard}
              disabled={!focusCard}
            >
              Flip Card {buttonProgress}
            </Button>
          )}
        </PlayActionSwap>
      </PlayActionZone>

      <Drawer
        open={overviewOpen}
        title="Table View"
        contentClassName="table-drawer-content"
        contentMaxHeight="min(76dvh, 44rem)"
        onClose={() => setOverviewOpen(false)}
      >
        <TableMap cards={state.table.cards} activeIndex={focusIndex} cardBackId={state.cardBackId} />
      </Drawer>
      <Drawer
        open={tableHitsOpen}
        title="Table Hits"
        contentClassName="table-hits-drawer-content"
        contentMaxHeight="min(74dvh, 42rem)"
        onClose={() => setTableHitsOpen(false)}
      >
        {focusCard && <TableHitsDrawer card={focusCard} />}
      </Drawer>
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
      <RulesDrawer open={rulesOpen} scope="context" phase="table" onClose={() => setRulesOpen(false)} />
    </PlayScreen>
  );
}

function TableMap({ activeIndex, cardBackId, cards }: { activeIndex: number; cardBackId: CardBackId; cards: TableCard[] }) {
  const rows = [5, 4, 3, 2, 1] as const;
  return (
    <div className="table-map mx-auto w-full max-w-[38rem] pb-1 pt-1">
      <div className="table-map-felt" aria-label="Table card layout">
        {rows.map((row) => (
          <div key={row} className="table-map-row">
            <span className="table-row-marker">Give {row}</span>
            <div className="table-row-cards">
              {cards
                .map((card, index) => ({ card, index }))
                .filter(({ card }) => card.row === row)
                .map(({ card, index }) => (
                  <TableMapTile
                    key={card.id}
                    active={index === activeIndex}
                    card={card}
                    cardBackId={cardBackId}
                  />
                ))}
            </div>
            <span className="table-row-spacer" aria-hidden="true" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TableMapTile({ active, card, cardBackId }: { active: boolean; card: TableCard; cardBackId: CardBackId }) {
  const revealed = card.faceUp;
  return (
    <div
      className={`table-map-tile ${active ? 'is-active' : ''}`}
      title={revealed ? `${card.card.rank} ${card.card.suit}, Give ${card.value}` : `Hidden table card, Give ${card.value}`}
      aria-current={active ? 'true' : undefined}
    >
      <div className="table-map-card-surface">
        {revealed ? (
          <SimplifiedTableCard card={card} />
        ) : (
          <CardBack id={cardBackId} size="fluid" />
        )}
      </div>
    </div>
  );
}

function SimplifiedTableCard({ card }: { card: TableCard }) {
  const red = card.card.color === 'red';
  return (
    <div className={`table-simple-card ${red ? 'is-red' : 'is-black'}`} aria-label={`${card.card.rank} ${card.card.suit}`}>
      <span className="table-simple-rank">{card.card.rank}</span>
      <span className="table-simple-suit">{suitGlyphs[card.card.suit]}</span>
    </div>
  );
}

function TableHero({ card }: { card: TableCard | null }) {
  if (!card) {
    return <div className="h-8" />;
  }
  return (
    <motion.div layout className="table-status-line grid max-w-full gap-[clamp(0.35rem,1.4vh,0.65rem)] overflow-hidden">
      <h2 className="deal-player-name table-row-title min-w-0 truncate pb-[0.12em] text-[clamp(2.85rem,12vw,6.2rem)] font-black leading-[1.06] tracking-normal text-[var(--rtb-text)] sm:text-[clamp(3.4rem,8vw,6.7rem)]">
        Row {card.row}
      </h2>
    </motion.div>
  );
}

type TableCardTransitionDirection = 'next' | 'none';
const tableCardEase = [0.22, 1, 0.36, 1] as const;
const tableCardFlipEase = [0.2, 0.75, 0.25, 1] as const;
const tableCardExitBuffer = 96;
const tableCardAspect = 5 / 7;
const tableCardMaxWidth = 500;

function computeTableFocusSize(containerWidth: number, containerHeight: number) {
  const usableWidth = Math.max(1, containerWidth - 16);
  const usableHeight = Math.max(1, containerHeight - 12);
  const stageLimitedWidth = Math.min(usableWidth, usableHeight * tableCardAspect);
  const responsiveMaxWidth = Math.min(
    tableCardMaxWidth,
    Math.max(280, usableWidth * (usableWidth >= 760 ? 0.56 : 0.7))
  );
  const width = Math.round(Math.min(stageLimitedWidth, responsiveMaxWidth));

  return {
    height: Math.round(width / tableCardAspect),
    width,
  };
}

function TableCardFocus({
  card,
  cardBackId,
  transitionDirection,
}: {
  card: TableCard | null;
  cardBackId: CardBackId;
  transitionDirection: TableCardTransitionDirection;
}) {
  const reduceMotion = useReducedMotion();
  const focusRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cardSize, setCardSize] = useState<{ height: number; width: number } | null>(null);
  const [slideDistance, setSlideDistance] = useState(520);

  useLayoutEffect(() => {
    const updateFocusMetrics = () => {
      const focusWidth = focusRef.current?.getBoundingClientRect().width ?? 0;
      const focusHeight = focusRef.current?.getBoundingClientRect().height ?? 0;
      if (!focusWidth || !focusHeight) return;

      const nextCardSize = computeTableFocusSize(focusWidth, focusHeight);
      setCardSize((previous) =>
        previous?.height === nextCardSize.height && previous.width === nextCardSize.width ? previous : nextCardSize
      );
      setSlideDistance(Math.ceil((focusWidth + nextCardSize.width) / 2 + tableCardExitBuffer));
    };

    updateFocusMetrics();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateFocusMetrics);
      window.visualViewport?.addEventListener('resize', updateFocusMetrics);
      return () => {
        window.removeEventListener('resize', updateFocusMetrics);
        window.visualViewport?.removeEventListener('resize', updateFocusMetrics);
      };
    }

    const resizeObserver = new ResizeObserver(updateFocusMetrics);
    if (focusRef.current) resizeObserver.observe(focusRef.current);
    window.visualViewport?.addEventListener('resize', updateFocusMetrics);

    return () => {
      resizeObserver.disconnect();
      window.visualViewport?.removeEventListener('resize', updateFocusMetrics);
    };
  }, []);

  if (!card) {
    return null;
  }

  const cardVariants = {
    initial: (direction: TableCardTransitionDirection) => ({
      opacity: reduceMotion || direction === 'next' ? 1 : 0,
      scale: reduceMotion || direction === 'next' ? 1 : 0.985,
      x: reduceMotion ? 0 : direction === 'next' ? slideDistance : 0,
    }),
    animate: {
      opacity: 1,
      scale: 1,
      x: 0,
    },
    exit: (direction: TableCardTransitionDirection) => ({
      opacity: reduceMotion || direction === 'next' ? 1 : 0,
      scale: reduceMotion || direction === 'next' ? 1 : 0.985,
      x: reduceMotion ? 0 : direction === 'next' ? -slideDistance : 0,
    }),
  };
  const transition: Transition = reduceMotion
    ? { duration: 0.01 }
    : transitionDirection === 'next'
      ? { duration: 0.44, ease: tableCardEase }
      : card.faceUp
        ? { ...playFadeTransition, duration: 0.28, ease: tableCardEase }
        : playFadeTransition;

  return (
    <div ref={focusRef} className="table-card-focus relative flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-visible px-[clamp(0.25rem,2vw,1.5rem)] py-[clamp(0.4rem,2vh,1rem)]">
      <div ref={cardRef} className="table-focus-card" style={cardSize ? { height: cardSize.height, width: cardSize.width } : undefined}>
        <AnimatePresence custom={transitionDirection} initial={false} mode="sync">
          <motion.div
            key={card.id}
            custom={transitionDirection}
            className="table-focus-card-motion"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
          >
            <motion.div
              className="table-card-flip"
              initial={false}
              animate={{ rotateY: card.faceUp ? 180 : 0 }}
              transition={reduceMotion ? { duration: 0.01 } : { duration: 0.42, ease: tableCardFlipEase }}
            >
              <div className="table-card-face">
                <CardBack id={cardBackId} size="fluid" />
              </div>
              <div className="table-card-face table-card-front">
                <PlayingCard
                  animateEntry={false}
                  card={card.card}
                  motionLayout={false}
                  size="fluid"
                />
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function TableResult({ card, onViewAll, revealed }: { card: TableCard; onViewAll: () => void; revealed: boolean }) {
  if (!card) {
    return null;
  }

  if (!revealed) {
    return null;
  }

  const summaries = summarizeTableHits(card.matchedAssignments);
  const totalUnits = summaries.reduce((sum, summary) => sum + summary.units, 0);
  if (!summaries.length) {
    return (
      <div className="deal-outcome table-outcome inline-flex max-w-[22rem] items-center text-left">
        <motion.span
          key="no-matches"
          className="deal-outcome-summary table-outcome-summary text-[clamp(0.95rem,3.4vw,1.15rem)] font-black leading-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...playFadeTransition, duration: 0.12 }}
        >
          No matches
        </motion.span>
      </div>
    );
  }

  const manyHits = summaries.length > 3;
  const visibleSummaries = manyHits ? summaries.slice(0, 2) : summaries;

  return (
    <motion.div
      key={`${card.id}-${summaries.length}-${totalUnits}`}
      className={`deal-outcome table-outcome table-hit-result w-full max-w-[23rem] text-left ${manyHits ? 'is-many' : 'is-small'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ...playFadeTransition, duration: 0.12 }}
    >
      {manyHits && (
        <div className="table-hit-summary-row">
          <span>{summaries.length} players hit</span>
          <span>Give {card.value}</span>
        </div>
      )}
      <TableHitRows summaries={visibleSummaries} />
      {manyHits && (
        <button type="button" className="table-hit-view-all" onClick={onViewAll}>
          View all {summaries.length}
        </button>
      )}
    </motion.div>
  );
}

function TableHitRows({ summaries }: { summaries: ReturnType<typeof summarizeTableHits> }) {
  return (
    <div className="table-hit-rows">
      {summaries.map((summary) => (
        <div key={summary.playerId} className="table-hit-row">
          <span className="table-hit-name">{tableHitLine(summary)}</span>
          {tableHitCountLabel(summary) && <span className="table-hit-count">{tableHitCountLabel(summary)}</span>}
        </div>
      ))}
    </div>
  );
}

function TableHitsDrawer({ card }: { card: TableCard }) {
  const summaries = summarizeTableHits(card.matchedAssignments);
  const totalUnits = summaries.reduce((sum, summary) => sum + summary.units, 0);

  if (!summaries.length) {
    return (
      <div className="table-hits-drawer-empty">
        No matches on {card.card.rank} {suitGlyphs[card.card.suit]}.
      </div>
    );
  }

  return (
    <div className="table-hits-drawer">
      <div className="table-hits-drawer-hero">
        <div>
          <p className="table-hits-drawer-eyebrow">Row {card.row}</p>
          <p className="table-hits-drawer-title">
            {card.card.rank} {suitGlyphs[card.card.suit]}
          </p>
        </div>
        <div className="table-hits-drawer-total">
          <span>{summaries.length}</span>
          <span>hits</span>
        </div>
      </div>
      <div className="table-hits-drawer-meta">
        <span>Give {card.value}</span>
        <span>{totalUnits} total</span>
      </div>
      <TableHitRows summaries={summaries} />
    </div>
  );
}
