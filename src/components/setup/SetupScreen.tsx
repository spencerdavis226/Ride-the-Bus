import { Settings } from 'lucide-react';
import { useState } from 'react';
import { useGame } from '../../app/GameProvider';
import { calculatePhaseOneTwoDecks } from '../../game/deck';
import { Button } from '../common/Button';
import { Drawer } from '../common/Drawer';
import { BottomActionBar } from '../layout/BottomActionBar';
import { PlayerEditor } from './PlayerEditor';
import { SettingsPanel } from './SettingsPanel';

export function SetupScreen() {
  const { state, dispatch, hasSavedGame, savedGame } = useGame();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const names = state.settings.playerNames;
  const deckCount = calculatePhaseOneTwoDecks(names.length);
  const validNames = names.map((name, index) => name.trim() || `Player ${index + 1}`);

  return (
    <section className="flex flex-1 flex-col gap-4">
      <div className="glass-panel rounded-xl p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-[#fff7e6]/70">Players</p>
            <p className="text-3xl font-bold">{names.length}</p>
          </div>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold text-[#f5d99b] ring-1 ring-white/10"
          >
            <Settings size={18} /> Settings
          </button>
        </div>
        <PlayerEditor names={names} onChange={(nextNames) => dispatch({ type: 'SETUP_SET_PLAYERS', names: nextNames })} />
      </div>
      <div className="rounded-xl border border-[#f5d99b]/20 bg-black/[0.18] p-4 text-sm text-[#fff7e6]/74">
        <p className="font-semibold text-[#fff7e6]">Using {deckCount} deck{deckCount === 1 ? '' : 's'} for this game.</p>
        <p className="mt-1">Deal and The Table share this shoe. The Bus always starts fresh.</p>
      </div>
      <BottomActionBar>
        {hasSavedGame && (
          <Button variant="secondary" onClick={() => savedGame && dispatch({ type: 'HYDRATE', state: savedGame })}>
            Resume Game
          </Button>
        )}
        <Button onClick={() => dispatch({ type: 'START_GAME' })}>Start Game</Button>
        <Button
          variant="ghost"
          onClick={() => dispatch({ type: 'SETUP_SET_PLAYERS', names: validNames.map((_, index) => `Player ${index + 1}`) })}
        >
          Quick Launch Names
        </Button>
      </BottomActionBar>
      <Drawer open={settingsOpen} title="Settings" onClose={() => setSettingsOpen(false)}>
        <SettingsPanel
          busMode={state.settings.busMode}
          animationSpeed={state.settings.animationSpeed}
          themePreference={state.settings.themePreference}
          onBusMode={(mode) => dispatch({ type: 'SETUP_SET_BUS_MODE', mode })}
          onAnimationSpeed={(speed) => dispatch({ type: 'SET_ANIMATION_SPEED', speed })}
          onTheme={(theme) => dispatch({ type: 'SET_THEME', theme })}
        />
      </Drawer>
    </section>
  );
}
