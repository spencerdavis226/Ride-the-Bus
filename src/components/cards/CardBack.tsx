import type { CardBackId } from '../../game/state';

const backClasses: Record<CardBackId, string> = {
  emerald: 'from-[#0f5b43] to-[#092118] border-[#f5d99b]/40',
  ivory: 'from-[#f6e7bd] to-[#9b6e3c] border-[#271811]/45 text-[#142019]',
  ruby: 'from-[#7d1622] to-[#1f0a0d] border-[#f5d99b]/35',
  midnight: 'from-[#1e2636] to-[#06070b] border-[#d7b56d]/30',
  brass: 'from-[#5a411e] to-[#15100a] border-[#f5d99b]/40',
  plaid: 'from-[#174532] to-[#872d32] border-[#f5d99b]/25',
  obsidian: 'from-[#18181b] to-[#030305] border-[#f5d99b]/25',
  sapphire: 'from-[#16467c] to-[#061426] border-[#9dc8ff]/35',
  amethyst: 'from-[#4c1d68] to-[#14051f] border-[#dfb5ff]/30',
  jade: 'from-[#0b6b55] to-[#05221b] border-[#b7f5d8]/28',
  cherry: 'from-[#a01634] to-[#23050b] border-[#ffd1da]/32',
  carbon: 'from-[#2d333b] to-[#080a0d] border-[#cbd5e1]/25',
  casino: 'from-[#0f6b3f] via-[#81212d] to-[#18110a] border-[#f5d99b]/35',
  sunset: 'from-[#a84b2a] to-[#2a0f12] border-[#ffd08a]/35',
  frost: 'from-[#d8f4ff] to-[#5b7c93] border-[#10202a]/35 text-[#10202a]',
  moss: 'from-[#4d6428] to-[#121a0c] border-[#e6d77f]/30',
  pearl: 'from-[#fff1d2] to-[#c7b083] border-[#2c2416]/35 text-[#142019]',
  royal: 'from-[#243c8f] to-[#090d2b] border-[#f5d99b]/35',
  ember: 'from-[#8e2d16] to-[#160807] border-[#ffb37b]/35',
  mint: 'from-[#9de8c8] to-[#277154] border-[#09231a]/35 text-[#09231a]',
  grape: 'from-[#67236f] to-[#17071b] border-[#e7b8ef]/32',
  slate: 'from-[#475569] to-[#0f172a] border-[#cbd5e1]/25',
  rose: 'from-[#be4767] to-[#2a0b16] border-[#ffd3dc]/35',
  lagoon: 'from-[#087f8c] to-[#052f37] border-[#a5f3fc]/30',
  whiskey: 'from-[#8a5524] to-[#1a0f07] border-[#f5d99b]/35',
  noir: 'from-[#111827] to-[#020617] border-[#f8fafc]/22',
  coral: 'from-[#e26d5c] to-[#33100d] border-[#ffe0bd]/35',
  linen: 'from-[#eadfc8] to-[#74624a] border-[#241a10]/35 text-[#142019]',
  orchid: 'from-[#9d4edd] to-[#230b3a] border-[#f0c4ff]/35',
  cobalt: 'from-[#1d4ed8] to-[#08112f] border-[#bfdbfe]/35'
};

type CardSize = 'compact' | 'normal' | 'deal' | 'hand' | 'hero' | 'fluid';

const sizeClasses: Record<CardSize, string> = {
  compact: 'h-20 w-14',
  normal: 'h-28 w-20',
  deal: 'h-36 w-24',
  hand: 'aspect-[5/7] h-full max-h-[9rem] w-auto max-w-full',
  hero: 'h-44 w-32',
  fluid: 'w-full h-full'
};

export function CardBack({ id, compact = false, size }: { id: CardBackId; compact?: boolean; size?: CardSize }) {
  const resolvedSize = size ?? (compact ? 'compact' : 'normal');
  const markClass =
    resolvedSize === 'hero' ? 'h-16 w-16'
    : resolvedSize === 'fluid' ? 'h-[40%] w-[40%]'
    : resolvedSize === 'deal' || resolvedSize === 'hand' ? 'h-12 w-12'
    : 'h-9 w-9';
  return (
    <div className={`relative grid place-items-center overflow-hidden rounded-lg border bg-gradient-to-br ${backClasses[id]} ${sizeClasses[resolvedSize]} shadow-card shadow-[inset_0_0_0_8px_rgba(255,255,255,0.12)]`}>
      <div className="absolute top-[10%] h-[5%] w-[30%] rounded-full bg-current/25" />
      <div className={`${markClass} rounded-full border border-current/30 bg-black/15`} />
    </div>
  );
}
