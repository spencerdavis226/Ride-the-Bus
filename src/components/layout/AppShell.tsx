import { BookOpen, History, House, Palette, RotateCcw } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useGame } from '../../app/GameProvider';
import { getThemeClass, themes } from '../../styles/themes';
import { Button } from '../common/Button';
import { Drawer } from '../common/Drawer';
import { IconButton } from '../common/IconButton';
import { HistoryDrawer } from '../log/HistoryDrawer';
import { RulesDrawer } from '../rules/RulesDrawer';
import { ThemeDrawer } from '../setup/ThemeDrawer';
import { SafeArea } from './SafeArea';

export function AppShell({ children }: { children: ReactNode }) {
  const { state, dispatch } = useGame();
  const [logOpen, setLogOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const isSetup = state.phase === 'setup';
  const showHome = state.phase !== 'setup';
  const showLog = state.phase !== 'setup';
  const themeClass = getThemeClass(state.theme);
  const hideChrome =
    state.phase === 'deal' ||
    state.phase === 'table' ||
    state.phase === 'busIntro' ||
    state.phase === 'bus' ||
    state.phase === 'gameOver';

  function quitToSetup() {
    setQuitOpen(false);
    dispatch({ type: 'QUIT_TO_SETUP' });
  }

  useEffect(() => {
    const root = document.documentElement;
    const themeClasses = themes.map((theme) => theme.className);
    root.classList.remove(...themeClasses);
    root.classList.add(themeClass);
    root.classList.toggle('rtb-document-scroll', isSetup);
    if (!isSetup) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    root.style.colorScheme =
      state.theme === 'light' || state.theme === 'summer' || state.theme === 'winter' || state.theme === 'spring'
        ? 'light'
        : 'dark';
    return () => {
      root.classList.remove(themeClass);
      root.classList.remove('rtb-document-scroll');
      root.style.colorScheme = '';
    };
  }, [isSetup, state.theme, themeClass]);

  return (
    <main
      className={`${themeClass} app-shell h-full overflow-hidden text-[var(--rtb-text)]`}
      data-phase={state.phase}
      data-rigid-scroll={isSetup ? 'false' : 'true'}
    >
      <div
        className="landscape-blocker fixed inset-0 z-[70] flex-col items-center justify-center gap-4 bg-[var(--rtb-app-bg)] text-center text-[var(--rtb-text)]"
        role="status"
      >
        <RotateCcw size={36} className="text-[var(--rtb-accent)] opacity-70" />
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--rtb-text-muted)]">Rotate to play</p>
      </div>
      <SafeArea>
        <div className="mx-auto flex h-full w-full max-w-none flex-col">
          {!hideChrome && (
            <header className={`relative mb-3 flex shrink-0 items-center justify-between gap-3 px-4 ${isSetup ? 'pt-1' : 'pt-1'}`}>
              {isSetup ? (
                <>
                  <IconButton ghost label="Themes" onClick={() => setThemeOpen(true)}>
                    <Palette size={20} />
                  </IconButton>
                  <p className="pointer-events-none absolute left-1/2 max-w-[52vw] -translate-x-1/2 truncate text-center text-[0.82rem] font-black uppercase tracking-[0.2em] text-[var(--rtb-text-muted)]">
                    Ride the Bus
                  </p>
                </>
              ) : (
                <div className="min-w-0">
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.26em] text-[var(--rtb-accent)] opacity-70">
                    Ride the Bus
                  </p>
                  <h1 className="text-[1.8rem] font-black leading-tight tracking-tight text-[var(--rtb-text)]">
                    {phaseTitle(state.phase)}
                  </h1>
                </div>
              )}
              <div className="flex shrink-0">
                {showHome && (
                  <IconButton ghost label="Home" onClick={() => setQuitOpen(true)}>
                    <House size={20} />
                  </IconButton>
                )}
                <IconButton ghost label="Rules" onClick={() => setRulesOpen(true)}>
                  <BookOpen size={20} />
                </IconButton>
                {showLog && (
                  <IconButton ghost label="History" onClick={() => setLogOpen(true)}>
                    <History size={20} />
                  </IconButton>
                )}
              </div>
            </header>
          )}
          <div
            className={`min-h-0 min-w-0 flex-1 ${
              hideChrome
                ? 'flex flex-col overflow-hidden pb-0'
                : `overflow-y-auto overflow-x-hidden px-3 ${isSetup ? 'pb-0' : 'pb-4'}`
            }`}
          >
            {children}
          </div>
        </div>
      </SafeArea>

      <HistoryDrawer open={logOpen} onClose={() => setLogOpen(false)} />
      <Drawer open={quitOpen} title="Go Home" onClose={() => setQuitOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm leading-6 text-[var(--rtb-text)] opacity-75">
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
      <ThemeDrawer open={themeOpen} onClose={() => setThemeOpen(false)} />
      <RulesDrawer open={rulesOpen} scope="full" onClose={() => setRulesOpen(false)} />
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
