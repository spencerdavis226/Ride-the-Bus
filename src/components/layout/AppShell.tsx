import { BookOpen, History, RotateCcw } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useGame } from '../../app/GameProvider';
import { getThemeClass } from '../../styles/themes';
import { IconButton } from '../common/IconButton';
import { LogDrawer } from '../log/LogDrawer';
import { Drawer } from '../common/Drawer';
import { SafeArea } from './SafeArea';

export function AppShell({ children }: { children: ReactNode }) {
  const { state, dispatch } = useGame();
  const [logOpen, setLogOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <main className={`${getThemeClass(state.theme)} min-h-dvh overflow-hidden text-[#fff7e6]`}>
      <SafeArea>
        <div className="mx-auto flex min-h-[calc(100dvh-32px)] w-full max-w-3xl flex-col">
          <header className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#f5d99b]/70">Ride the Bus</p>
              <h1 className="text-2xl font-bold leading-tight">{phaseTitle(state.phase)}</h1>
            </div>
            <div className="flex gap-2">
              {state.undo && (
                <IconButton label="Undo latest action" onClick={() => dispatch({ type: 'UNDO_LAST_ACTION' })}>
                  <RotateCcw size={19} />
                </IconButton>
              )}
              <IconButton label="Rules" onClick={() => setRulesOpen(true)}>
                <BookOpen size={19} />
              </IconButton>
              <IconButton label="Game log" onClick={() => setLogOpen(true)}>
                <History size={19} />
              </IconButton>
            </div>
          </header>
          {children}
        </div>
      </SafeArea>
      <LogDrawer open={logOpen} onClose={() => setLogOpen(false)} />
      <Drawer open={rulesOpen} title="Rules" onClose={() => setRulesOpen(false)}>
        <div className="space-y-4 text-sm leading-6 text-[#fff7e6]/82">
          <p>Deal uses Red/Black, Higher/Lower/Same, Inside/Outside/Same, then Suit. Use Give and Take units.</p>
          <p>The Table flips eleven cards. Matching ranks from player hands autoplay and give the row value.</p>
          <p>The riders with the most cards left ride together. The Bus starts from a fresh single deck.</p>
          <p className="text-[#f5d99b]">Small table superstition: on September 1, Aces sit low.</p>
        </div>
      </Drawer>
    </main>
  );
}

function phaseTitle(phase: string): string {
  if (phase === 'deal') return 'Deal';
  if (phase === 'table') return 'The Table';
  if (phase === 'busIntro' || phase === 'bus') return 'The Bus';
  if (phase === 'gameOver') return 'Game Over';
  return 'Setup';
}
