import { AnimatePresence, motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
import { useState } from 'react';
import { useGame } from '../../app/GameProvider';
import { suitGlyphs } from '../../game/cards';
import type { CardBackId, DrinkAssignment, TableCard } from '../../game/state';
import { CardBack } from '../cards/CardBack';
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

      <PlayFelt className="table-felt">
        <motion.div
          key="table-stage"
          className="table-turn-content deal-turn-content relative flex h-full min-h-0 flex-col overflow-x-hidden overflow-y-visible p-[clamp(0.9rem,3vw,1.5rem)]"
          initial={{ y: 18, scale: 0.985 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
        >
          <div className="deal-turn-main table-turn-main mx-auto mb-auto mt-auto flex h-full w-full max-w-full min-w-0 flex-col gap-[clamp(0.5rem,2.4vh,1rem)]">
            <div className="deal-hero table-hero shrink-0">
              <TableHero card={focusCard} />
              <div className="deal-outcome-slot table-outcome-slot">
                {focusCard && (
                  <TableResult
                    key={`${focusCard.id}-${reviewingFlip ? 'review' : 'ready'}`}
                    card={focusCard}
                    revealed={reviewingFlip}
                  />
                )}
              </div>
            </div>

            <div className="deal-stage table-stage grid min-h-0 flex-1 grid-cols-1 grid-rows-1 overflow-visible">
              <TableCardFocus card={focusCard} />
            </div>
          </div>
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
            Flip Card {buttonProgress}
          </Button>
        )}
      </PlayActionZone>

      <Drawer open={overviewOpen} title="Table View" onClose={() => setOverviewOpen(false)}>
        <TableMap cards={state.table.cards} activeIndex={focusIndex} cardBackId={state.cardBackId} />
      </Drawer>
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
          <p>Flip table cards in order. Matching ranks from player hands are played automatically.</p>
          <p>Rows give the row value. The riders with the most cards left ride together.</p>
          <p className="text-[#f5d99b]">Aces are high, except on September 1st.</p>
        </div>
      </Drawer>
    </PlayScreen>
  );
}

function TableMap({ activeIndex, cardBackId, cards }: { activeIndex: number; cardBackId: CardBackId; cards: TableCard[] }) {
  const rows = [5, 4, 3, 2, 1] as const;
  return (
    <div className="table-map mx-auto grid w-full max-w-[34rem] gap-3 pb-1 pt-2">
      {rows.map((row) => (
        <div key={row} className="table-map-row flex items-start justify-center gap-[clamp(0.45rem,2vw,0.75rem)]">
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
      ))}
    </div>
  );
}

function TableMapTile({ active, card, cardBackId }: { active: boolean; card: TableCard; cardBackId: CardBackId }) {
  const revealed = card.faceUp;
  const red = card.card.color === 'red';
  return (
    <div className="table-map-card grid justify-items-center gap-1">
      <div
        className={`table-map-tile grid place-items-center overflow-hidden rounded-[0.65rem] border text-center shadow-sm ${
          active
            ? 'border-[#f5d99b] bg-[#f5d99b]/10 text-[#f5d99b] shadow-[0_0_0_1px_rgba(245,217,155,0.26),0_0_22px_rgba(245,217,155,0.18)] ring-2 ring-[#f5d99b]/70'
            : revealed
              ? `border-black/20 bg-[#fbf2d9] ${red ? 'text-[#b72e35]' : 'text-[#111827]'}`
              : 'border-white/[0.08] bg-transparent text-[#f5d99b]/42'
        }`}
        title={revealed ? `${card.card.rank} ${card.card.suit}, Give ${card.value}` : `Hidden table card, Give ${card.value}`}
      >
        {revealed ? (
          <span className="table-map-face grid leading-none">
            <span className="table-map-rank text-[clamp(0.9rem,4vw,1.15rem)] font-black">{card.card.rank}</span>
            <span className="table-map-suit text-[clamp(0.95rem,4vw,1.2rem)] font-black">{suitGlyphs[card.card.suit]}</span>
            <span className="table-map-inline-value hidden text-[0.5rem] font-black leading-none">Give {card.value}</span>
          </span>
        ) : (
          <span className="table-map-back relative block h-full w-full rounded-[inherit]">
            <CardBack id={cardBackId} size="fluid" />
            <span className="table-map-inline-value hidden text-[0.5rem] font-black leading-none">Give {card.value}</span>
          </span>
        )}
      </div>
      <span className={`table-map-value rounded-full px-2 py-0.5 text-[0.62rem] font-black leading-none ${active ? 'bg-[#f5d99b] text-[#142019]' : 'bg-white/[0.08] text-[#f5d99b]/72'}`}>
        Give {card.value}
      </span>
    </div>
  );
}

function TableHero({ card }: { card: TableCard | null }) {
  if (!card) {
    return <div className="h-8" />;
  }
  return (
    <div className="table-status-line grid max-w-full gap-[clamp(0.35rem,1.4vh,0.65rem)] overflow-hidden">
      <h2 className="deal-player-name table-row-title min-w-0 truncate pb-[0.12em] text-[clamp(2.85rem,12vw,6.2rem)] font-black leading-[1.06] tracking-normal text-[#fff7e6] sm:text-[clamp(3.4rem,8vw,6.7rem)]">
        Row {card.row}
      </h2>
    </div>
  );
}

function TableCardFocus({ card }: { card: TableCard | null }) {
  if (!card) {
    return null;
  }

  return (
    <div className="table-card-focus flex h-full min-h-0 w-full min-w-0 items-center justify-center px-[clamp(0.25rem,2vw,1.5rem)] py-[clamp(0.4rem,2vh,1rem)]">
      <motion.div
        key={`${card.id}-${card.faceUp ? 'up' : 'down'}`}
        className="table-focus-card"
        initial={card.faceUp ? { rotateY: 90 } : { rotateY: 0 }}
        animate={{ rotateY: 0 }}
        transition={{ duration: 0.24 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <PlayingCard
          animateEntry={false}
          card={card.card}
          faceUp={card.faceUp}
          highlighted={card.faceUp}
          motionLayout={false}
          size="fluid"
        />
      </motion.div>
    </div>
  );
}

function TableResult({ card, revealed }: { card: TableCard; revealed: boolean }) {
  if (!card) {
    return null;
  }

  const summary = revealed ? tableResultSummary(card.matchedAssignments) : `Give ${card.value}`;
  return (
    <motion.div
      className="deal-outcome table-outcome inline-flex max-w-[22rem] items-center text-left"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
    >
      <span className="deal-outcome-summary table-outcome-summary text-[clamp(0.95rem,3.4vw,1.15rem)] font-black leading-tight">
        {summary}
      </span>
    </motion.div>
  );
}

function tableResultSummary(assignments: DrinkAssignment[]) {
  if (!assignments.length) {
    return 'No matches';
  }
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
  const summaries = Object.values(grouped);
  if (summaries.length === 1) {
    const [summary] = summaries;
    return `${summary.name}: Give ${summary.units}`;
  }
  const totalUnits = summaries.reduce((sum, summary) => sum + summary.units, 0);
  return `${summaries.length} players give ${totalUnits}`;
}
