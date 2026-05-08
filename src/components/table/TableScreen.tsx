import { List } from 'lucide-react';
import { useState } from 'react';
import { useGame } from '../../app/GameProvider';
import { CardStack } from '../cards/CardStack';
import { Button } from '../common/Button';
import { Drawer } from '../common/Drawer';
import { BottomActionBar } from '../layout/BottomActionBar';
import { HistoryTimeline } from '../log/HistoryTimeline';
import { BowlingTableLayout } from './BowlingTableLayout';
import { MatchAnimationLayer } from './MatchAnimationLayer';
import { TableFlipSummary } from './TableFlipSummary';

export function TableScreen() {
  const { state, dispatch } = useGame();
  const [historyOpen, setHistoryOpen] = useState(false);
  const faceUpCards = state.table.cards.filter((card) => card.faceUp);
  const lastFlipped = faceUpCards[faceUpCards.length - 1];
  const nextCard = state.table.cards[state.table.activeIndex];
  const total = state.table.cards.length;

  return (
    <section className="flex flex-1 flex-col gap-3">
      <div className="glass-panel rounded-2xl p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-[#f5d99b]/65">
              Flip {Math.min(state.table.activeIndex + 1, total)} of {total}
            </p>
            <h2 className="mt-0.5 text-2xl font-black leading-tight text-[#fff7e6]">The Table</h2>
          </div>
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-white/[0.09] px-3.5 text-sm font-semibold text-[#f5d99b] ring-1 ring-white/[0.08] transition-[transform,background-color] duration-100 active:scale-95 active:bg-white/[0.15]"
          >
            <List size={15} />
            History
          </button>
        </div>
        <BowlingTableLayout cards={state.table.cards} />
        <MatchAnimationLayer />
      </div>

      {lastFlipped && <TableFlipSummary assignments={lastFlipped.matchedAssignments} />}

      <div className="grid grid-cols-2 gap-2">
        {state.players.map((player) => (
          <div
            key={player.id}
            className="rounded-2xl bg-black/[0.24] p-3.5 ring-1 ring-white/[0.08]"
          >
            <div className="mb-2.5 flex items-center justify-between">
              <span className="truncate text-sm font-bold text-[#fff7e6]">{player.name}</span>
              <span className="text-xs font-semibold text-[#f5d99b]/70">{player.hand.length} left</span>
            </div>
            <CardStack cards={player.hand} maxVisible={3} />
          </div>
        ))}
      </div>

      <BottomActionBar>
        <Button
          className="w-full text-base"
          onClick={() => dispatch({ type: 'TABLE_FLIP_NEXT' })}
          disabled={!nextCard}
        >
          {nextCard ? 'Flip Next' : 'Continue →'}
        </Button>
      </BottomActionBar>

      <Drawer open={historyOpen} title="Table History" onClose={() => setHistoryOpen(false)}>
        <HistoryTimeline cards={state.table.cards} />
      </Drawer>
    </section>
  );
}
