import { motion } from 'framer-motion';
import { suitGlyphs, type Card } from '../../game/cards';
import { useGame } from '../../app/GameProvider';
import { CardBack } from './CardBack';

export function PlayingCard({
  animateEntry = true,
  card,
  faceUp = true,
  compact = false,
  highlighted = false,
  motionLayout = true,
  size
}: {
  animateEntry?: boolean;
  card?: Card | null;
  faceUp?: boolean;
  compact?: boolean;
  highlighted?: boolean;
  motionLayout?: boolean;
  size?: 'compact' | 'normal' | 'deal' | 'hand' | 'hero' | 'fluid';
}) {
  const { state } = useGame();
  const resolvedSize = size ?? (compact ? 'compact' : 'normal');

  if (!faceUp || !card) return <CardBack id={state.cardBackId} size={resolvedSize} />;

  const red = card.color === 'red';
  const animDuration = 0.22;

  if (resolvedSize === 'fluid') {
    return (
      <motion.div
        layout={motionLayout}
        className={`card-fluid relative flex h-full w-full flex-col justify-between rounded-xl border bg-card-face text-card-text shadow-card ${
          highlighted ? 'ring-2 ring-gold' : 'border-black/10'
        }`}
        style={{ padding: '6%', transformPerspective: 900 }}
        initial={animateEntry ? { rotateY: 90 } : false}
        animate={{ rotateY: 0 }}
        transition={{ duration: animDuration, ease: 'easeOut' }}
      >
        <div
          className={`inline-flex flex-col items-center gap-0 self-start font-bold leading-none tabular-nums ${red ? 'text-red-suit' : 'text-card-text'}`}
          style={{ fontSize: '14cqw' }}
        >
          <span>{card.rank}</span>
          <span className="block leading-none">{suitGlyphs[card.suit]}</span>
        </div>
        <div
          className={`self-center ${red ? 'text-red-suit' : 'text-card-text'}`}
          style={{ fontSize: '38cqw' }}
        >
          {suitGlyphs[card.suit]}
        </div>
        <div
          className={`inline-flex rotate-180 flex-col items-center gap-0 self-end font-bold leading-none tabular-nums ${red ? 'text-red-suit' : 'text-card-text'}`}
          style={{ fontSize: '14cqw' }}
        >
          <span>{card.rank}</span>
          <span className="block leading-none">{suitGlyphs[card.suit]}</span>
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
      layout={motionLayout}
      className={`relative flex flex-col justify-between rounded-lg border bg-card-face text-card-text shadow-card ${sizeClasses[resolvedSize]} ${
        highlighted ? 'ring-2 ring-gold' : 'border-black/10'
      }`}
      style={{ transformPerspective: 900 }}
      initial={animateEntry ? { rotateY: 90 } : false}
      animate={{ rotateY: 0 }}
      transition={{ duration: animDuration, ease: 'easeOut' }}
    >
      <div
        className={`inline-flex flex-col items-center gap-0 self-start font-bold leading-none tabular-nums ${cornerClasses[resolvedSize]} ${red ? 'text-red-suit' : 'text-card-text'}`}
      >
        <span>{card.rank}</span>
        <span className="block leading-none">{suitGlyphs[card.suit]}</span>
      </div>
      <div className={`self-center ${centerClasses[resolvedSize]} ${red ? 'text-red-suit' : 'text-card-text'}`}>{suitGlyphs[card.suit]}</div>
      <div
        className={`inline-flex rotate-180 flex-col items-center gap-0 self-end font-bold leading-none tabular-nums ${cornerClasses[resolvedSize]} ${red ? 'text-red-suit' : 'text-card-text'}`}
      >
        <span>{card.rank}</span>
        <span className="block leading-none">{suitGlyphs[card.suit]}</span>
      </div>
    </motion.div>
  );
}
