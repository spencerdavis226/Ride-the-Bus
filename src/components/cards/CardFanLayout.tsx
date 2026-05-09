import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { Card } from '../../game/cards';
import type { CardBackId } from '../../game/state';
import { computeFan } from '../../lib/cardFan';
import { springs } from '../../lib/motion';
import { CardBack } from './CardBack';
import { PlayingCard } from './PlayingCard';

type CardFanLayoutProps = {
  cards: (Card | null)[];
  cardBackId: CardBackId;
  highlightedIndex?: number;
  cardCount?: number; // default 4
};

export function CardFanLayout({ cards, cardBackId, highlightedIndex, cardCount = 4 }: CardFanLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) setDims({ w: width, h: height });
    };
    measure();
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setDims({ w: width, h: height });
    });
    obs.observe(el);
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(measure); });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      obs.disconnect();
    };
  }, []);

  const fan = dims.w > 0 && dims.h > 0 ? computeFan(dims.w, dims.h, { cardCount }) : null;
  const totalFanW = fan ? fan.cardW + fan.step * (cardCount - 1) : 0;

  return (
    <div
      ref={containerRef}
      className="flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-visible px-[clamp(0.25rem,2vw,1.5rem)] py-[clamp(0.4rem,2vh,1rem)]"
    >
      {fan && (
        <div className="relative shrink-0" style={{ width: totalFanW, height: fan.cardH }}>
          {Array.from({ length: cardCount }, (_, i) => {
            const card = cards[i] ?? null;
            const highlighted = highlightedIndex === i;
            return (
              <motion.div
                key={i}
                className="absolute top-0"
                style={{
                  left: i * fan.step,
                  width: fan.cardW,
                  height: fan.cardH,
                  zIndex: i + (highlighted ? 10 : 0),
                }}
                initial={false}
                animate={{ y: highlighted ? -Math.min(18, fan.cardH * 0.06) : 0 }}
                transition={springs.cardHighlight}
              >
                {card ? (
                  <PlayingCard card={card} size="fluid" highlighted={highlighted} motionLayout={false} />
                ) : (
                  <div className="h-full w-full rotate-180">
                    <CardBack id={cardBackId} size="fluid" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
