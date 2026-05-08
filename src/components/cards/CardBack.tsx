import type { CardBackId } from '../../game/state';

const backClasses: Record<CardBackId, string> = {
  emerald: 'from-[#0f5b43] to-[#092118] border-[#f5d99b]/40',
  ivory: 'from-[#f6e7bd] to-[#9b6e3c] border-[#271811]/45 text-[#142019]',
  ruby: 'from-[#7d1622] to-[#1f0a0d] border-[#f5d99b]/35',
  midnight: 'from-[#1e2636] to-[#06070b] border-[#d7b56d]/30',
  brass: 'from-[#5a411e] to-[#15100a] border-[#f5d99b]/40',
  plaid: 'from-[#174532] to-[#872d32] border-[#f5d99b]/25'
};

export function CardBack({ id, compact = false }: { id: CardBackId; compact?: boolean }) {
  return (
    <div className={`relative grid place-items-center overflow-hidden rounded-lg border bg-gradient-to-br ${backClasses[id]} ${compact ? 'h-20 w-14' : 'h-28 w-20'} shadow-card`}>
      <div className="absolute inset-2 rounded-md border border-current/25" />
      <div className="h-9 w-9 rounded-full border border-current/30 bg-black/15" />
    </div>
  );
}
