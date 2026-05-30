import { useId } from 'react';
import type { CardBackId } from '../../game/state';
import { getCardBackPalette } from './cardBackPalette';
import { CardBackFrame } from './CardBackFrame';
import { CardBackMedallion } from './CardBackMedallion';
import { CardBackPatternDefs, CardBackPatternFill } from './CardBackPattern';

type CardSize = 'compact' | 'normal' | 'deal' | 'hand' | 'hero' | 'fluid';

const sizeClasses: Record<CardSize, string> = {
  compact: 'h-20 w-14',
  normal: 'h-28 w-20',
  deal: 'h-36 w-24',
  hand: 'aspect-[5/7] h-full max-h-[9rem] w-auto max-w-full',
  hero: 'h-44 w-32',
  fluid: 'h-full w-full',
};

export function CardBack({
  highlighted = false,
  id,
  compact = false,
  size,
}: {
  highlighted?: boolean;
  id: CardBackId;
  compact?: boolean;
  size?: CardSize;
}) {
  const uid = useId().replace(/:/g, '');
  const palette = getCardBackPalette(id);
  const resolvedSize = size ?? (compact ? 'compact' : 'normal');

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${palette.gradient} ${palette.border} ${sizeClasses[resolvedSize]} shadow-card ${
        highlighted ? 'ring-2 ring-[var(--rtb-focus)]' : ''
      }`}
      style={{
        boxShadow: [
          '0 18px 40px rgba(0, 0, 0, 0.32)',
          'inset 0 1px 0 rgba(255, 255, 255, 0.14)',
          'inset 0 -2px 8px rgba(0, 0, 0, 0.35)',
        ].join(', '),
      }}
    >
      <svg className="absolute inset-0 h-full w-full" aria-hidden>
        <CardBackPatternDefs
          uid={uid}
          pattern={palette.pattern}
          accent={palette.accent}
          opacity={palette.patternOpacity}
        />
        <CardBackPatternFill uid={uid} pattern={palette.pattern} />
      </svg>

      <CardBackFrame accent={palette.accent} light={palette.light} />
      <CardBackMedallion accent={palette.accent} light={palette.light} textColor={palette.text} />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${palette.foil}33 0%, transparent 42%, transparent 58%, ${palette.foil}1a 100%)`,
        }}
      />

      {highlighted && (
        <div
          className="card-back-shimmer pointer-events-none absolute inset-0 opacity-60 motion-reduce:opacity-0"
          style={{
            background: `linear-gradient(105deg, transparent 38%, ${palette.foil}55 50%, transparent 62%)`,
          }}
        />
      )}
    </div>
  );
}
