import { BookOpen, History, House, RotateCcw } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useGame } from '../../app/GameProvider';
import { getThemeClass } from '../../styles/themes';
import { Button } from '../common/Button';
import { Drawer } from '../common/Drawer';
import { IconButton } from '../common/IconButton';
import { LogDrawer } from '../log/LogDrawer';
import { SafeArea } from './SafeArea';

export function AppShell({ children }: { children: ReactNode }) {
  const { state, dispatch } = useGame();
  const [logOpen, setLogOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const showHome = state.phase !== 'setup';
  const hideChrome = state.phase === 'deal';

  function quitToSetup() {
    setQuitOpen(false);
    dispatch({ type: 'QUIT_TO_SETUP' });
  }

  return (
    <main className={`${getThemeClass(state.theme)} h-dvh overflow-hidden text-[#fff7e6]`}>
      <div className="landscape-blocker fixed inset-0 z-50 flex-col items-center justify-center gap-4 bg-[#071812] text-[#fff7e6]">
        <RotateCcw size={36} className="text-[#f5d99b]/60" />
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#fff7e6]/60">Rotate to play</p>
      </div>
      <SafeArea>
        <div className="mx-auto flex h-full w-full max-w-none flex-col">
          {!hideChrome && (
            <header className="mb-3 flex shrink-0 items-center justify-between gap-3 px-4 pt-1">
              <div className="min-w-0">
                <p className="text-[0.62rem] font-black uppercase tracking-[0.26em] text-[#f5d99b]/60">
                  Ride the Bus
                </p>
                <h1 className="text-[1.8rem] font-black leading-tight tracking-tight text-[#fff7e6]">
                  {phaseTitle(state.phase)}
                </h1>
              </div>
              <div className="flex shrink-0">
                {showHome && (
                  <IconButton ghost label="Home" onClick={() => setQuitOpen(true)}>
                    <House size={18} />
                  </IconButton>
                )}
                <IconButton ghost label="Rules" onClick={() => setRulesOpen(true)}>
                  <BookOpen size={18} />
                </IconButton>
                <IconButton ghost label="Game log" onClick={() => setLogOpen(true)}>
                  <History size={18} />
                </IconButton>
              </div>
            </header>
          )}
          <div
            className={`min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden ${
              hideChrome ? 'pb-0' : 'px-3 pb-4'
            }`}
          >
            {children}
          </div>
        </div>
      </SafeArea>

      <LogDrawer open={logOpen} onClose={() => setLogOpen(false)} />
      <Drawer open={quitOpen} title="Go Home" onClose={() => setQuitOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm leading-6 text-[#fff7e6]/72">
            Return to setup and clear this run? Your player names and settings will stay ready for the next game.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setQuitOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={quitToSetup}>
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
