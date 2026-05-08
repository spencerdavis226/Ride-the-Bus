import { useGame } from '../../app/GameProvider';
import { BottomActionBar } from '../layout/BottomActionBar';
import { GuessControls } from './GuessControls';
import { PlayerTurnPanel } from './PlayerTurnPanel';

export function DealScreen() {
  const { state, dispatch } = useGame();
  const player = state.players[state.deal.playerIndex];
  return (
    <section className="flex flex-1 flex-col gap-4">
      <div className="grid grid-cols-4 gap-2 text-center text-xs text-[#fff7e6]/60">
        {state.players.map((candidate) => (
          <div key={candidate.id} className={`rounded-lg px-2 py-2 ${candidate.id === player.id ? 'bg-[#f5d99b] text-[#142019]' : 'bg-white/[0.08]'}`}>
            <div className="truncate font-semibold">{candidate.name}</div>
            <div>{candidate.hand.length}/4</div>
          </div>
        ))}
      </div>
      <PlayerTurnPanel player={player} deal={state.deal} />
      <BottomActionBar>
        <GuessControls subphase={state.deal.subphase} onGuess={(guess) => dispatch({ type: 'DEAL_GUESS', guess })} />
      </BottomActionBar>
    </section>
  );
}
