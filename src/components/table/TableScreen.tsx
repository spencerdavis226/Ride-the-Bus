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
  const lastFlipped = state.table.cards.filter((card) => card.faceUp).at(-1);
  const nextCard = state.table.cards[state.table.activeIndex];

  return (
    <section className="flex flex-1 flex-col gap-4">
      <div className="glass-panel rounded-xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#f5d99b]/72">Flip {Math.min(state.table.activeIndex + 1, state.table.cards.length)} of {state.table.cards.length}</p>
            <h2 className="text-2xl font-bold">The Table</h2>
          </div>
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold text-[#f5d99b] ring-1 ring-white/10"
          >
            <List size={18} /> History
          </button>
        </div>
        <BowlingTableLayout cards={state.table.cards} />
        <MatchAnimationLayer />
      </div>
      {lastFlipped && <TableFlipSummary assignments={lastFlipped.matchedAssignments} />}
      <div className="grid grid-cols-2 gap-2">
        {state.players.map((player) => (
          <div key={player.id} className="rounded-xl bg-black/20 p-3 ring-1 ring-white/10">
            <div className="mb-2 flex items-center justify-between">
              <span className="truncate text-sm font-semibold">{player.name}</span>
              <span className="text-xs text-[#f5d99b]/80">{player.hand.length} left</span>
            </div>
            <CardStack cards={player.hand} maxVisible={3} />
          </div>
        ))}
      </div>
      <BottomActionBar>
        <Button onClick={() => dispatch({ type: 'TABLE_FLIP_NEXT' })} disabled={!nextCard}>
          {nextCard ? 'Flip Next' : 'Continue'}
        </Button>
      </BottomActionBar>
      <Drawer open={historyOpen} title="Table History" onClose={() => setHistoryOpen(false)}>
        <HistoryTimeline cards={state.table.cards} />
      </Drawer>
    </section>
  );
}
