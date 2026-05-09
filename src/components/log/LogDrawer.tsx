import { useGame } from '../../app/GameProvider';
import { Drawer } from '../common/Drawer';

export function LogDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useGame();
  return (
    <Drawer open={open} title="Game Log" onClose={onClose}>
      {state.log.length === 0 ? (
        <p className="text-sm text-cream/65">No game events yet.</p>
      ) : (
        <ol className="space-y-3">
          {state.log
            .slice()
            .reverse()
            .map((entry) => (
              <li key={entry.id} className="rounded-lg bg-white/[0.07] p-3 text-sm text-cream/86">
                <span className="mr-2 rounded-full bg-white/10 px-2 py-1 text-[11px] uppercase tracking-wide text-gold/80">
                  {entry.kind}
                </span>
                {entry.text}
              </li>
            ))}
        </ol>
      )}
    </Drawer>
  );
}
