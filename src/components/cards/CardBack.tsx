import type { CardBackId } from '../../game/state';

const backClasses: Record<CardBackId, string> = {
  emerald: 'from-[#0f5b43] to-[#092118] border-[#f5d99b]/40',
  ivory: 'from-[#f6e7bd] to-[#9b6e3c] border-[#271811]/45 text-[#142019]',
  ruby: 'from-[#7d1622] to-[#1f0a0d] border-[#f5d99b]/35',
  midnight: 'from-[#1e2636] to-[#06070b] border-[#d7b56d]/30',
  brass: 'from-[#5a411e] to-[#15100a] border-[#f5d99b]/40',
  plaid: 'from-[#174532] to-[#872d32] border-[#f5d99b]/25'
};

type CardSize = 'compact' | 'normal' | 'deal' | 'hand' | 'hero';

const sizeClasses: Record<CardSize, string> = {
  compact: 'h-20 w-14',
  normal: 'h-28 w-20',
  deal: 'h-36 w-24',
  hand: 'aspect-[5/7] w-full max-w-[5.75rem]',
  hero: 'h-44 w-32'
};

export function CardBack({ id, compact = false, size }: { id: CardBackId; compact?: boolean; size?: CardSize }) {
  const resolvedSize = size ?? (compact ? 'compact' : 'normal');
  const markClass = resolvedSize === 'hero' ? 'h-16 w-16' : resolvedSize === 'deal' || resolvedSize === 'hand' ? 'h-12 w-12' : 'h-9 w-9';
  return (
    <div className={`relative grid place-items-center overflow-hidden rounded-lg border bg-gradient-to-br ${backClasses[id]} ${sizeClasses[resolvedSize]} shadow-card`}>
      <div className="absolute inset-2 rounded-md border border-current/25" />
      <div className={`${markClass} rounded-full border border-current/30 bg-black/15`} />
    </div>
  );
}
