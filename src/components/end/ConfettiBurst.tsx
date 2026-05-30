import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';

const COLORS = [
  'var(--rtb-accent)',
  'var(--rtb-text)',
  'var(--rtb-danger)',
  'var(--rtb-success)',
  'var(--rtb-warning)',
] as const;

type PieceShape = 'rect' | 'circle' | 'strip';

type ConfettiPiece = {
  id: number;
  left: string;
  delay: number;
  duration: number;
  drift: number;
  rotateStart: number;
  rotateEnd: number;
  color: (typeof COLORS)[number];
  shape: PieceShape;
  width: number;
  height: number;
};

function buildPieces(): ConfettiPiece[] {
  const waves = [
    { count: 18, delayBase: 0, delaySpread: 0.45 },
    { count: 16, delayBase: 1.35, delaySpread: 0.55 },
    { count: 14, delayBase: 2.75, delaySpread: 0.65 },
    { count: 12, delayBase: 4.1, delaySpread: 0.7 },
  ];

  const pieces: ConfettiPiece[] = [];
  let id = 0;

  for (const wave of waves) {
    for (let i = 0; i < wave.count; i++) {
      const seed = id * 17 + i * 31;
      const shapeRoll = seed % 10;
      const shape: PieceShape = shapeRoll < 4 ? 'rect' : shapeRoll < 7 ? 'strip' : 'circle';
      const wide = shape === 'rect';
      const strip = shape === 'strip';

      pieces.push({
        id: id++,
        left: `${2 + (seed % 96)}%`,
        delay: wave.delayBase + (i / wave.count) * wave.delaySpread,
        duration: 7.2 + (seed % 5) * 0.85,
        drift: ((seed % 200) - 100) * 0.9,
        rotateStart: (seed % 120) - 60,
        rotateEnd: 540 + (seed % 720),
        color: COLORS[seed % COLORS.length],
        shape,
        width: strip ? 3 : wide ? 10 : 7,
        height: strip ? 14 : wide ? 6 : 7,
      });
    }
  }

  return pieces;
}

const PIECES = buildPieces();

function pieceClassName(shape: PieceShape): string {
  if (shape === 'circle') return 'rounded-full';
  if (shape === 'strip') return 'rounded-[1px]';
  return 'rounded-[2px]';
}

export function ConfettiBurst() {
  const reduceMotion = useReducedMotion();
  const pieces = useMemo(() => PIECES, []);

  if (reduceMotion) {
    return null;
  }

  return (
    <div className="confetti-burst pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          className={`confetti-piece absolute ${pieceClassName(piece.shape)}`}
          style={{
            left: piece.left,
            top: '-12%',
            width: piece.width,
            height: piece.height,
            backgroundColor: piece.color,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.18)',
          }}
          initial={{
            y: 0,
            x: 0,
            rotate: piece.rotateStart,
            opacity: 0,
            scale: 0.6,
          }}
          animate={{
            y: ['0vh', '125vh'],
            x: [0, piece.drift * 0.55, piece.drift, piece.drift * 0.35, piece.drift * 0.7],
            rotate: [piece.rotateStart, piece.rotateEnd],
            opacity: [0, 1, 1, 1, 0],
            scale: [0.6, 1, 1, 0.95, 0.85],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeIn',
            times: [0, 0.12, 0.55, 0.88, 1],
            opacity: { times: [0, 0.06, 0.5, 0.92, 1], ease: 'easeOut' },
            scale: { times: [0, 0.1, 0.5, 0.9, 1], ease: 'easeOut' },
          }}
        />
      ))}
    </div>
  );
}
