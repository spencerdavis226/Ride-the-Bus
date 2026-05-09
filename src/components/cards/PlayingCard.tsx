import { motion } from 'framer-motion';
import { suitGlyphs, type Card } from '../../game/cards';
import { useGame } from '../../app/GameProvider';
import { CardBack } from './CardBack';

export function PlayingCard({
  card,
  faceUp = true,
  compact = false,
  highlighted = false,
  size
}: {
  card?: Card | null;
  faceUp?: boolean;
  compact?: boolean;
  highlighted?: boolean;
  size?: 'compact' | 'normal' | 'deal' | 'hand' | 'hero' | 'fluid';
}) {
  const { state } = useGame();
  const resolvedSize = size ?? (compact ? 'compact' : 'normal');

  if (!faceUp || !card) return <CardBack id={state.cardBackId} size={resolvedSize} />;

  const red = card.color === 'red';
  const animDuration = state.settings.animationSpeed === 'fast' ? 0.12 : 0.22;

  if (resolvedSize === 'fluid') {
    return (
      <motion.div
        layout
        className={`card-fluid relative flex h-full w-full flex-col justify-between rounded-xl border bg-[#fbf2d9] text-[#111827] shadow-card ${
          highlighted ? 'ring-2 ring-[#f5d99b]' : 'border-black/10'
        }`}
        style={{ padding: '6%' }}
        initial={{ rotateY: 90 }}
        animate={{ rotateY: 0 }}
        transition={{ duration: animDuration }}
      >
        <div
          className={`text-left font-bold leading-none ${red ? 'text-[#b72e35]' : 'text-[#111827]'}`}
          style={{ fontSize: '14cqw' }}
        >
          <div>{card.rank}</div>
          <div>{suitGlyphs[card.suit]}</div>
        </div>
        <div
          className={`self-center ${red ? 'text-[#b72e35]' : 'text-[#111827]'}`}
          style={{ fontSize: '38cqw' }}
        >
          {suitGlyphs[card.suit]}
        </div>
        <div
          className={`rotate-180 text-left font-bold leading-none ${red ? 'text-[#b72e35]' : 'text-[#111827]'}`}
          style={{ fontSize: '14cqw' }}
        >
          <div>{card.rank}</div>
          <div>{suitGlyphs[card.suit]}</div>
        </div>
      </motion.div>
    );
  }

  const sizeClasses = {
    compact: 'h-20 w-14 p-2',
    normal: 'h-28 w-20 p-2',
    deal: 'h-36 w-24 p-2.5',
    hand: 'aspect-[5/7] h-full max-h-[9rem] w-auto max-w-full p-[clamp(0.35rem,1.5vw,0.5rem)]',
    hero: 'h-44 w-32 p-3'
  };
  const centerClasses = {
    compact: 'text-3xl',
    normal: 'text-3xl',
    deal: 'text-5xl',
    hand: 'text-[clamp(1.5rem,6vw,2.75rem)]',
    hero: 'text-6xl'
  };
  const cornerClasses = {
    compact: 'text-base',
    normal: 'text-base',
    deal: 'text-xl',
    hand: 'text-[clamp(0.8rem,3.2vw,1.1rem)]',
    hero: 'text-2xl'
  };

  return (
    <motion.div
      layout
      className={`relative flex flex-col justify-between rounded-lg border bg-[#fbf2d9] text-[#111827] shadow-card ${sizeClasses[resolvedSize]} ${
        highlighted ? 'ring-2 ring-[#f5d99b]' : 'border-black/10'
      }`}
      initial={{ rotateY: 90 }}
      animate={{ rotateY: 0 }}
      transition={{ duration: animDuration }}
    >
      <div className={`text-left font-bold leading-none ${cornerClasses[resolvedSize]} ${red ? 'text-[#b72e35]' : 'text-[#111827]'}`}>
        <div>{card.rank}</div>
        <div>{suitGlyphs[card.suit]}</div>
      </div>
      <div className={`self-center ${centerClasses[resolvedSize]} ${red ? 'text-[#b72e35]' : 'text-[#111827]'}`}>{suitGlyphs[card.suit]}</div>
      <div className={`rotate-180 text-left font-bold leading-none ${cornerClasses[resolvedSize]} ${red ? 'text-[#b72e35]' : 'text-[#111827]'}`}>
        <div>{card.rank}</div>
        <div>{suitGlyphs[card.suit]}</div>
      </div>
    </motion.div>
  );
}
