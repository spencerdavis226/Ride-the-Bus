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
  size?: 'compact' | 'normal' | 'hero';
}) {
  const { state } = useGame();
  const resolvedSize = size ?? (compact ? 'compact' : 'normal');
  const sizeClasses = {
    compact: 'h-20 w-14 p-2',
    normal: 'h-28 w-20 p-2',
    hero: 'h-44 w-32 p-3'
  };
  const centerClasses = {
    compact: 'text-3xl',
    normal: 'text-3xl',
    hero: 'text-6xl'
  };
  const cornerClasses = {
    compact: 'text-base',
    normal: 'text-base',
    hero: 'text-2xl'
  };
  if (!faceUp || !card) return <CardBack id={state.cardBackId} size={resolvedSize} />;
  const red = card.color === 'red';
  return (
    <motion.div
      layout
      className={`relative flex flex-col justify-between rounded-lg border bg-[#fbf2d9] text-[#111827] shadow-card ${sizeClasses[resolvedSize]} ${
        highlighted ? 'ring-2 ring-[#f5d99b]' : 'border-black/10'
      }`}
      initial={{ rotateY: 90, opacity: 0.5 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: state.settings.animationSpeed === 'fast' ? 0.12 : 0.22 }}
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
