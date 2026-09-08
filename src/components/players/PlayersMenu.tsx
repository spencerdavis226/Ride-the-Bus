import { Users } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useGame } from '../../app/GameProvider';
import { formatPlayerNameInput, PLAYER_NAME_MAX_LENGTH } from '../../game/playerNames';
import { decksNeededForJoin, joinsNextMatch } from '../../game/roster';
import type { Player } from '../../game/state';
import { Button } from '../common/Button';
import { Drawer } from '../common/Drawer';
import { IconButton } from '../common/IconButton';

export function PlayersMenu() {
  const { state, dispatch } = useGame();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const [name, setName] = useState('');
  const [removing, setRemoving] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const queued = joinsNextMatch(state);
  const extraDecks = decksNeededForJoin(state);
  const explanation = state.phase === 'deal'
    ? 'New players get cards for completed rounds, without awards or penalties. Their first guess is at the end of this round.'
    : state.phase === 'table'
      ? 'New players get four cards. Matches with earlier reveals are removed without awards. They play from here.'
      : 'New players are saved for the next match. The current Bus continues with its remaining riders.';

  function playerRow(player: Player, isQueued = false) {
    const canRemove = isQueued || state.phase !== 'gameOver';
    const endsMatch = !isQueued && (state.players.length === 1 || (state.phase === 'bus' && state.bus?.riders.length === 1 && state.bus.riders[0].id === player.id));
    return (
      <li key={player.id} className="rounded-2xl bg-[var(--rtb-surface-soft)] px-3 py-2">
        <div className="flex min-h-11 items-center justify-between gap-3">
          <span className="min-w-0 truncate font-bold">{player.name}</span>
          {canRemove && removing !== player.id && <Button variant="ghost" className="shrink-0 px-3 text-sm" aria-label={`Remove ${player.name}`} onClick={() => setRemoving(player.id)}>Remove</Button>}
        </div>
        {removing === player.id && <div className="space-y-3 pb-2">
          <p className="text-sm">{endsMatch ? `Removing ${player.name} ends this match.` : isQueued ? `Remove ${player.name} from the next match?` : `Remove ${player.name}? Their remaining cards leave play.`}</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setRemoving(null)}>Keep player</Button>
            <Button variant="danger" onClick={() => {
              dispatch({ type: 'REMOVE_PLAYER', playerId: player.id });
              setRemoving(null);
              setNotice(`${player.name} removed.`);
              if (endsMatch) setOpen(false);
            }}>{endsMatch ? 'End match' : 'Remove'}</Button>
          </div>
        </div>}
      </li>
    );
  }

  return <>
    <IconButton ghost label="Players" onClick={() => { setOpen(true); setNotice(''); setRemoving(null); }}><Users size={21} strokeWidth={2.25} /></IconButton>
    <Drawer open={open} title="Players" onClose={close}>
      <div className="space-y-5">
        <ul className="space-y-2" aria-label="Current players">{state.players.map(player => playerRow(player))}</ul>
        {state.queuedPlayers.length > 0 && <section aria-label="Next match">
          <h3 className="mb-2 text-sm font-bold text-[var(--rtb-text-muted)]">Next match</h3>
          <ul className="space-y-2">{state.queuedPlayers.map(player => playerRow(player, true))}</ul>
        </section>}
        <form className="space-y-3" onSubmit={event => {
          event.preventDefault();
          if (!name.trim()) return;
          dispatch({ type: 'ADD_PLAYER', name });
          setNotice(`${name.trim()} ${queued ? 'is ready for the next match' : 'joined'}.${extraDecks ? ` Added ${extraDecks} deck${extraDecks === 1 ? '' : 's'} to the undrawn cards.` : ''}`);
          setName('');
        }}>
          <label htmlFor="new-player-name" className="block font-bold">{queued ? 'Add for next match' : 'Add a player'}</label>
          <p className="text-sm leading-6 text-[var(--rtb-text-muted)]">{state.phase === 'gameOver' ? 'New players will join when you play again.' : explanation}</p>
          {extraDecks > 0 && <p className="text-sm text-[var(--rtb-text-muted)]">Joining adds {extraDecks} deck{extraDecks === 1 ? '' : 's'} to the undrawn cards. Hands and table cards stay as dealt.</p>}
          <div className="flex gap-2">
            <input id="new-player-name" value={name} maxLength={PLAYER_NAME_MAX_LENGTH} autoComplete="off" placeholder="Name" onChange={event => setName(formatPlayerNameInput(event.target.value))} className="min-w-0 flex-1 rounded-xl border border-[var(--rtb-border)] bg-[var(--rtb-surface-soft)] px-3 py-3 text-[var(--rtb-text)] focus:outline-none focus:ring-2 focus:ring-[var(--rtb-accent)]" />
            <Button type="submit" disabled={!name.trim()}>{queued ? 'Add' : 'Join'}</Button>
          </div>
          <p role="status" className="text-sm text-[var(--rtb-text-muted)]">{notice}</p>
        </form>
      </div>
    </Drawer>
  </>;
}
