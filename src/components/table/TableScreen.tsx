import { AnimatePresence, motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [previewPlayerId, setPreviewPlayerId] = useState<string | null>(null);
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);
  const previewPlayer = previewPlayerId ? state.players.find((candidate) => candidate.id === previewPlayerId) : null;
  const total = state.table.cards.length;
  const focusIndex = reviewIndex ?? state.table.activeIndex;
  const focusCard = state.table.cards[focusIndex] ?? null;
  const reviewingFlip = reviewIndex !== null;
  const buttonProgress = `${Math.min(focusIndex + 1, total)}/${total}`;

  function flipCurrentCard() {
    if (!focusCard || reviewingFlip) return;
    setReviewIndex(state.table.activeIndex);
    dispatch({ type: 'TABLE_FLIP_NEXT' });
  }

  function moveToNextCard() {
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
                {focusCard && <TableResult card={focusCard} revealed={reviewingFlip} />}
              </div>
            </motion.div>

            <motion.div layout className="deal-stage table-stage grid min-h-0 flex-1 grid-cols-1 grid-rows-1 overflow-visible">
              <TableCardFocus card={focusCard} />
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
              disabled={!state.table.cards[state.table.activeIndex]}
            >
              Next Card
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

function TableCardFocus({ card }: { card: TableCard | null }) {
  if (!card) {
    return null;
  }

  return (
    <motion.div layout className="table-card-focus flex h-full min-h-0 w-full min-w-0 items-center justify-center px-[clamp(0.25rem,2vw,1.5rem)] py-[clamp(0.4rem,2vh,1rem)]">
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={`${card.id}-${card.faceUp ? 'up' : 'down'}`}
          layout
          className="table-focus-card"
          initial={card.faceUp ? { rotateY: 88, opacity: 0.75, scale: 0.985 } : { opacity: 0, scale: 0.985 }}
          animate={{ rotateY: 0, opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.985 }}
          transition={card.faceUp ? { ...playFadeTransition, duration: 0.24 } : playFadeTransition}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <PlayingCard
            animateEntry={false}
            card={card.card}
            faceUp={card.faceUp}
            motionLayout={false}
            size="fluid"
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function TableResult({ card, revealed }: { card: TableCard; revealed: boolean }) {
  if (!card) {
    return null;
  }

  if (!revealed) {
    const summary = `Give ${card.value}`;
    return (
      <div className="deal-outcome table-outcome inline-flex max-w-[22rem] items-center text-left">
        <motion.span
          key={summary}
          className="deal-outcome-summary table-outcome-summary text-[clamp(0.95rem,3.4vw,1.15rem)] font-black leading-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...playFadeTransition, duration: 0.12 }}
        >
          {summary}
        </motion.span>
      </div>
    );
  }

  const summaries = summarizeTableHits(card.matchedAssignments);
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

  const motionKey = summaries.map((summary) => `${summary.playerId}:${summary.units}:${summary.count}`).join('|');
  const overflowCount = Math.max(0, summaries.length - 3);
  return (
    <div className="deal-outcome table-outcome w-full max-w-[23rem] text-left">
      <TableHitList motionKey={motionKey} scrollable={overflowCount > 0} summaries={summaries} />
    </div>
  );
}

function TableHitList({
  motionKey,
  scrollable,
  summaries,
}: {
  motionKey: string;
  scrollable: boolean;
  summaries: ReturnType<typeof summarizeTableHits>;
}) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [scrollState, setScrollState] = useState({ canScrollDown: false, canScrollUp: false });

  const updateScrollState = useCallback(() => {
    const list = listRef.current;
    if (!list || !scrollable) {
      setScrollState({ canScrollDown: false, canScrollUp: false });
      return;
    }

    const maxScrollTop = Math.max(0, list.scrollHeight - list.clientHeight);
    setScrollState({
      canScrollDown: list.scrollTop < maxScrollTop - 1,
      canScrollUp: list.scrollTop > 1
    });
  }, [scrollable]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    list.scrollTop = 0;
    const frame = window.requestAnimationFrame(updateScrollState);
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateScrollState);
    resizeObserver?.observe(list);
    window.addEventListener('resize', updateScrollState);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateScrollState);
    };
  }, [motionKey, updateScrollState]);

  const frameClasses = [
    'table-hit-list-frame',
    scrollable ? 'has-overflow' : '',
    scrollState.canScrollUp ? 'can-scroll-up' : '',
    scrollState.canScrollDown ? 'can-scroll-down' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={frameClasses}>
      <motion.div
        ref={listRef}
        key={motionKey}
        className={`table-hit-list ${scrollable ? 'is-scrollable' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...playFadeTransition, duration: 0.12 }}
        onScroll={updateScrollState}
      >
        {summaries.map((summary) => (
          <div key={summary.playerId} className="table-hit-row">
            <span className="table-hit-name">{tableHitLine(summary)}</span>
            {tableHitCountLabel(summary) && <span className="table-hit-count">{tableHitCountLabel(summary)}</span>}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
