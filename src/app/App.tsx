import { AppShell } from '../components/layout/AppShell';
import { BusIntroScreen } from '../components/bus/BusIntroScreen';
import { BusScreen } from '../components/bus/BusScreen';
import { DealScreen } from '../components/deal/DealScreen';
import { GameOverScreen } from '../components/end/GameOverScreen';
import { SetupScreen } from '../components/setup/SetupScreen';
import { TableScreen } from '../components/table/TableScreen';
import { useGame } from './GameProvider';

export function App() {
  const { state } = useGame();

  return (
    <AppShell>
      {state.phase === 'setup' && <SetupScreen />}
      {state.phase === 'deal' && <DealScreen />}
      {state.phase === 'table' && <TableScreen />}
      {state.phase === 'busIntro' && <BusIntroScreen />}
      {state.phase === 'bus' && <BusScreen />}
      {state.phase === 'gameOver' && <GameOverScreen />}
    </AppShell>
  );
}
