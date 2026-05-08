import { motion } from 'framer-motion';
import { suitGlyphs, type Card } from '../../game/cards';
import { useGame } from '../../app/GameProvider';
import { CardBack } from './CardBack';

export function PlayingCard({
  card,
  faceUp = true,
  compact = false,
  highlighted = false
}: {
  card?: Card | null;
  faceUp?: boolean;
  compact?: boolean;
  highlighted?: boolean;
}) {
  const { state } = useGame();
  if (!faceUp || !card) return <CardBack id={state.cardBackId} compact={compact} />;
  const red = card.color === 'red';
  return (
    <motion.div
      layout
      className={`relative flex flex-col justify-between rounded-lg border bg-[#fbf2d9] p-2 text-[#111827] shadow-card ${
        compact ? 'h-20 w-14' : 'h-28 w-20'
      } ${highlighted ? 'ring-2 ring-[#f5d99b]' : 'border-black/10'}`}
      initial={{ rotateY: 90, opacity: 0.5 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: state.settings.animationSpeed === 'fast' ? 0.12 : 0.22 }}
    >
      <div className={`text-left font-bold leading-none ${red ? 'text-[#b72e35]' : 'text-[#111827]'}`}>
        <div>{card.rank}</div>
        <div>{suitGlyphs[card.suit]}</div>
      </div>
      <div className={`self-center text-3xl ${red ? 'text-[#b72e35]' : 'text-[#111827]'}`}>{suitGlyphs[card.suit]}</div>
      <div className={`rotate-180 text-left font-bold leading-none ${red ? 'text-[#b72e35]' : 'text-[#111827]'}`}>
        <div>{card.rank}</div>
        <div>{suitGlyphs[card.suit]}</div>
      </div>
    </motion.div>
  );
}
