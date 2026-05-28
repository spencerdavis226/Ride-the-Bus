import type { CardBackPatternVariant } from './cardBackPalette';

type CardBackPatternProps = {
  accent: string;
  opacity: number;
  pattern: CardBackPatternVariant;
  uid: string;
};

export function CardBackPatternDefs({ accent, opacity, pattern, uid }: CardBackPatternProps) {
  const patternId = `${uid}-pattern-${pattern}`;
  const stroke = accent;
  const fill = accent;

  return (
    <defs>
      {pattern === 'damask' && (
        <pattern id={patternId} width="28" height="28" patternUnits="userSpaceOnUse">
          <g opacity={opacity} fill="none" stroke={stroke} strokeWidth="0.6">
            <path d="M14 1.5c3.5 4.5 7 5.5 7 9s-3.5 4.5-7 9-7-5.5-7-9 3.5-4.5 7-9z" />
            <path d="M1.5 14c4.5 3.5 5.5 7 9 7s4.5-3.5 9-7 5.5-7 9-7-3.5-4.5-9-7-5.5-7-9-7-3.5 4.5-9 7z" />
            <path d="M14 6c1.8 2.2 3.5 2.8 3.5 4.5S15.8 13 14 15s-3.5-2.8-3.5-4.5S12.2 8.2 14 6z" />
            <circle cx="14" cy="14" r="1.1" fill={fill} stroke="none" opacity="0.85" />
          </g>
        </pattern>
      )}
      {pattern === 'lattice' && (
        <pattern id={patternId} width="24" height="24" patternUnits="userSpaceOnUse">
          <g opacity={opacity} fill="none" stroke={stroke} strokeWidth="0.55">
            <path d="M0 12h24M12 0v24" />
            <path d="M0 0l24 24M24 0L0 24" />
            <rect x="9" y="9" width="6" height="6" rx="0.5" />
          </g>
        </pattern>
      )}
      {pattern === 'quatrefoil' && (
        <pattern id={patternId} width="32" height="32" patternUnits="userSpaceOnUse">
          <g opacity={opacity} fill="none" stroke={stroke} strokeWidth="0.6">
            <circle cx="16" cy="16" r="5" />
            <circle cx="16" cy="8" r="3" />
            <circle cx="16" cy="24" r="3" />
            <circle cx="8" cy="16" r="3" />
            <circle cx="24" cy="16" r="3" />
          </g>
        </pattern>
      )}
      {pattern === 'rays' && (
        <pattern id={patternId} width="30" height="30" patternUnits="userSpaceOnUse">
          <g opacity={opacity} fill="none" stroke={stroke} strokeWidth="0.5">
            <circle cx="15" cy="15" r="6" />
            {[0, 45, 90, 135].map((deg) => (
              <line
                key={deg}
                x1="15"
                y1="15"
                x2={15 + 12 * Math.cos((deg * Math.PI) / 180)}
                y2={15 + 12 * Math.sin((deg * Math.PI) / 180)}
              />
            ))}
            <path d="M15 3 L17 9 L15 7 L13 9 Z" fill={fill} stroke="none" />
            <path d="M15 27 L17 21 L15 23 L13 21 Z" fill={fill} stroke="none" />
          </g>
        </pattern>
      )}
      {pattern === 'weave' && (
        <pattern id={patternId} width="26" height="26" patternUnits="userSpaceOnUse">
          <g opacity={opacity} fill="none" stroke={stroke} strokeWidth="0.55">
            <path d="M0 6c6 0 6 6 13 6s7-6 13-6M0 20c6 0 6-6 13-6s7 6 13 6" />
            <path d="M6 0c0 6 6 6 6 13s-6 7-6 13M20 0c0 6-6 6-6 13s6 7 6 13" />
          </g>
        </pattern>
      )}
    </defs>
  );
}

export function CardBackPatternFill({
  pattern,
  uid,
}: {
  pattern: CardBackPatternVariant;
  uid: string;
}) {
  const patternId = `${uid}-pattern-${pattern}`;
  return <rect width="100%" height="100%" fill={`url(#${patternId})`} />;
}
