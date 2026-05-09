import { AnimatePresence, motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
import { useState } from 'react';
import { useGame } from '../../app/GameProvider';
import { suitGlyphs } from '../../game/cards';
import type { DrinkAssignment, TableCard } from '../../game/state';
import { springs, sceneEntryVariants } from '../../lib/motion';
import { PlayingCard } from '../cards/PlayingCard';
import { Button } from '../common/Button';
import { Drawer } from '../common/Drawer';
import { IconButton } from '../common/IconButton';
import {
  HandPreviewOverlay,
  PlayerTurnRail,
  PlayActionZone,
  PlayFelt,
  PlayScreen,
  PlayTopBar,
} from '../play/PlayLayout';

export function TableScreen() {
  const { state, dispatch } = useGame();
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const [previewPlayerId, setPreviewPlayerId] = useState<string | null>(null);
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);
  const previewPlayer = previewPlayerId ? state.players.find((candidate) => candidate.id === previewPlayerId) : null;
  const total = state.table.cards.length;
  const focusIndex = reviewIndex ?? state.table.activeIndex;
  const focusCard = state.table.cards[focusIndex] ?? null;
  const previousCard = focusIndex > 0 ? state.table.cards[focusIndex - 1] : null;
  const nextPreviewCard = focusIndex < total - 1 ? state.table.cards[focusIndex + 1] : null;
  const reviewingFlip = reviewIndex !== null;

  function flipCurrentCard() {
    if (!focusCard || reviewingFlip) return;
    setReviewIndex(state.table.activeIndex);
    dispatch({ type: 'TABLE_FLIP_NEXT' });
  }

  function moveToNextCard() {
    setReviewIndex(null);
  }

  return (
    <PlayScreen className="table-screen landscape-xs:gap-[0.55rem]">
      <PlayTopBar
        onHome={() => setQuitOpen(true)}
        onRules={() => setRulesOpen(true)}
        rightActions={(
          <IconButton ghost label="Table view" onClick={() => setOverviewOpen(true)}>
            <LayoutGrid size={21} strokeWidth={2.25} />
          </IconButton>
        )}
        showLog={false}
      />

      <PlayerTurnRail
        players={state.players}
        activePlayerId={null}
        onPreviewPlayer={(playerId) => setPreviewPlayerId(playerId)}
      />

      <PlayFelt className="table-felt landscape-xs:rounded-[1rem]">
        <motion.div
          key="table-stage"
          className="table-turn-content deal-turn-content flex h-full min-h-0 flex-col gap-[clamp(0.5rem,2.4vh,1rem)] p-[clamp(0.9rem,3vw,1.5rem)] landscape-xs:grid landscape-xs:grid-cols-[minmax(9rem,21vw)_minmax(0,1fr)_minmax(10rem,24vw)] landscape-xs:grid-rows-[minmax(0,1fr)] landscape-xs:items-center landscape-xs:gap-[clamp(0.75rem,2vw,1.25rem)] landscape-xs:px-[0.9rem] landscape-xs:py-[0.75rem]"
          variants={sceneEntryVariants}
          initial="hidden"
          animate="visible"
          transition={springs.sceneEntry}
        >
          <div className="deal-hero shrink-0 landscape-xs:self-center landscape-xs:min-w-0">
            <TableStatusLine
              card={focusCard}
              index={focusIndex}
              reviewing={reviewingFlip}
              total={total}
            />
          </div>

          <div className="deal-stage min-h-0 flex-1 landscape-xs:col-start-2 landscape-xs:row-start-1 landscape-xs:h-full landscape-xs:min-h-0 landscape-xs:max-h-none">
            <TableCarousel
              current={focusCard}
              next={nextPreviewCard}
              previous={previousCard}
            />
          </div>

          <TableResult card={reviewingFlip ? focusCard : null} />
        </motion.div>
      </PlayFelt>

      <PlayActionZone>
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
            Flip Card
          </Button>
        )}
      </PlayActionZone>

      <Drawer open={overviewOpen} title="Table View" onClose={() => setOverviewOpen(false)}>
        <TableOverview cards={state.table.cards} activeIndex={state.table.activeIndex} reviewIndex={reviewIndex} />
      </Drawer>
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
          <p>Flip table cards in order. Matching ranks from player hands are played automatically.</p>
          <p>Rows give the row value. The riders with the most cards left ride together.</p>
          <p className="text-gold">Aces are high, except on September 1st.</p>
        </div>
      </Drawer>
    </PlayScreen>
  );
}

function TableStatusLine({
  card,
  index,
  reviewing,
  total,
}: {
  card: TableCard | null;
  index: number;
  reviewing: boolean;
  total: number;
}) {
  if (!card) {
    return <div className="h-8" />;
  }
  return (
    <div className="table-status-line grid max-w-full gap-2 overflow-hidden">
      <span className="min-w-0 truncate text-[0.62rem] font-black uppercase tracking-[0.2em] text-gold/65">
        {reviewing ? 'Revealed' : 'Next'} {Math.min(index + 1, total)}/{total}
      </span>
      <span className="min-w-0 truncate text-[clamp(2.6rem,12vw,6rem)] font-black leading-[0.9] tracking-tight text-cream sm:text-[clamp(3rem,7vw,6.5rem)] landscape-xs:text-[clamp(2rem,5.5vw,3rem)]">
        Row {card.row}
      </span>
      <span className="min-w-0 truncate text-[clamp(1.1rem,4vw,1.6rem)] font-black leading-tight text-cream/70">
        {reviewing ? cardName(card) : `Give ${card.value}`}
      </span>
    </div>
  );
}

function TableCarousel({
  current,
  next,
  previous,
}: {
  current: TableCard | null;
  next: TableCard | null;
  previous: TableCard | null;
}) {
  const slots = [
    previous ? { card: previous, placement: 'previous' as const } : null,
    next ? { card: next, placement: 'next' as const } : null,
    current ? { card: current, placement: 'current' as const } : null,
  ].filter(Boolean) as Array<{ card: TableCard; placement: 'previous' | 'current' | 'next' }>;

  return (
    <div className="table-carousel-stage relative h-full min-h-0 overflow-hidden">
      {slots.map(({ card, placement }) => (
        <CarouselSlot
          key={card.id}
          tableCard={card}
          placement={placement}
        />
      ))}
    </div>
  );
}

function CarouselSlot({
  placement,
  tableCard,
}: {
  placement: 'previous' | 'current' | 'next';
  tableCard: TableCard;
}) {
  const placementMotion = {
    previous: { left: '32%', x: '-50%', scale: 0.75, zIndex: 5 },
    current: { left: '50%', x: '-50%', scale: 0.84, zIndex: 20 },
    next: { left: '68%', x: '-50%', scale: 0.75, zIndex: 10 },
  }[placement];

  return (
    <motion.div
      className="table-carousel-card absolute top-1/2 landscape-xs:h-[min(100%,12.8rem)] landscape-xs:min-h-[8.5rem] landscape-xs:max-w-[9.5rem]"
      initial={false}
      animate={{
        left: placementMotion.left,
        x: placementMotion.x,
        y: '-50%',
        scale: placementMotion.scale,
        zIndex: placementMotion.zIndex,
      }}
      transition={springs.carousel}
    >
      <motion.div
        key={`${tableCard.id}-${tableCard.faceUp ? 'up' : 'down'}`}
        className="h-full w-full"
        initial={tableCard.faceUp ? { rotateY: 90 } : { rotateY: 0 }}
        animate={{ rotateY: 0 }}
        transition={{ duration: 0.24 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <PlayingCard
          animateEntry={false}
          card={tableCard.card}
          faceUp={tableCard.faceUp}
          highlighted={placement === 'current' && tableCard.faceUp}
          motionLayout={false}
          size="fluid"
        />
      </motion.div>
    </motion.div>
  );
}

function TableResult({ card }: { card: TableCard | null }) {
  if (!card) {
    return (
      <div className="table-result rounded-2xl bg-black/18 px-4 py-3 text-sm font-bold text-cream/48 ring-1 ring-white/[0.06] landscape-xs:col-start-3 landscape-xs:row-start-1 landscape-xs:self-center landscape-xs:max-h-full landscape-xs:overflow-hidden landscape-xs:rounded-[1rem] landscape-xs:p-3">
        Flip the center card to start table matches.
      </div>
    );
  }

  if (!card.matchedAssignments.length) {
    return (
      <div className="table-result rounded-2xl bg-black/18 px-4 py-3 text-sm font-bold text-cream/58 ring-1 ring-white/[0.06] landscape-xs:col-start-3 landscape-xs:row-start-1 landscape-xs:self-center landscape-xs:max-h-full landscape-xs:overflow-hidden landscape-xs:rounded-[1rem] landscape-xs:p-3">
        No matches on {cardName(card)}.
      </div>
    );
  }

  const grouped = groupAssignments(card.matchedAssignments);
  return (
    <div className="table-result rounded-2xl bg-gold/[0.09] px-4 py-3 ring-1 ring-gold/20 landscape-xs:col-start-3 landscape-xs:row-start-1 landscape-xs:self-center landscape-xs:max-h-full landscape-xs:overflow-hidden landscape-xs:rounded-[1rem] landscape-xs:p-3">
      <p className="table-result-label mb-2 text-[0.58rem] font-black uppercase tracking-[0.22em] text-gold/75 landscape-xs:mb-[0.45rem] landscape-xs:text-[0.5rem] landscape-xs:tracking-[0.18em]">
        Match
      </p>
      <div className="grid gap-2">
        {grouped.map((summary) => (
          <div key={summary.playerId} className="table-result-row flex items-center justify-between gap-3 landscape-xs:gap-[0.35rem]">
            <span className="truncate text-sm font-black text-cream">{summary.name}</span>
            <span className="shrink-0 rounded-lg bg-gold px-2.5 py-1 text-xs font-black text-ink">
              Give {summary.units}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableOverview({ activeIndex, cards, reviewIndex }: { activeIndex: number; cards: TableCard[]; reviewIndex: number | null }) {
  const rows = [1, 2, 3, 4, 5] as const;
  const focusIndex = reviewIndex ?? activeIndex;
  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const rowCards = cards.filter((card) => card.row === row);
        return (
          <div key={row} className="rounded-2xl bg-white/[0.05] p-3 ring-1 ring-white/[0.06]">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-gold/68">Row {row}</span>
              <span className="text-xs font-bold text-cream/45">{rowCards.length} card{rowCards.length === 1 ? '' : 's'}</span>
            </div>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${rowCards.length}, minmax(0, 1fr))` }}>
              {rowCards.map((tableCard) => {
                const index = cards.findIndex((card) => card.id === tableCard.id);
                const active = index === focusIndex;
                return (
                  <div
                    key={tableCard.id}
                    className={`rounded-xl px-2 py-2 text-center ring-1 ${
                      active
                        ? 'bg-gold text-ink ring-gold'
                        : tableCard.faceUp
                          ? 'bg-card-face text-ink ring-black/10'
                          : 'bg-black/24 text-cream/62 ring-white/[0.08]'
                    }`}
                  >
                    <div className="text-xs font-black">{tableCard.faceUp ? cardName(tableCard) : `Card ${index + 1}`}</div>
                    <div className="mt-1 text-[0.65rem] font-black uppercase tracking-[0.12em] opacity-70">
                      Give {tableCard.value}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function cardName(tableCard: TableCard): string {
  return `${tableCard.card.rank}${suitGlyphs[tableCard.card.suit]}`;
}

function groupAssignments(assignments: DrinkAssignment[]) {
  const grouped = assignments.reduce<Record<string, { cards: number; playerId: string; name: string; units: number }>>((acc, assignment) => {
    acc[assignment.playerId] = acc[assignment.playerId] ?? {
      cards: 0,
      playerId: assignment.playerId,
      name: assignment.playerName,
      units: 0
    };
    acc[assignment.playerId].cards += 1;
    acc[assignment.playerId].units += assignment.units;
    return acc;
  }, {});
  return Object.values(grouped);
}
