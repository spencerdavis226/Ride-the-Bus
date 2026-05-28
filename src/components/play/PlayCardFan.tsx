import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useGame } from '../../app/GameProvider';
import type { Card } from '../../game/cards';
import { CardBack } from '../cards/CardBack';
import { PlayingCard } from '../cards/PlayingCard';
import { playFadeTransition, playLayoutTransition, PlayCardStage } from './PlayLayout';

export type PlayCardFanSlot = {
  ariaLabel?: string;
  card?: Card | null;
  faceUp: boolean;
  flipOnReveal?: boolean;
  highlighted?: boolean;
};

const SLOT_COUNT = 4;

export function computeFan(containerW: number, containerH: number) {
  const N = SLOT_COUNT;
  const ASPECT = 5 / 7; // card width / height
  const GAP = Math.max(8, Math.min(18, containerW * 0.02));
  const MAX_CARD_W = 340;
  const MIN_VISIBLE = 0.42; // min fraction visible on non-last cards when overlapping
  const TINY_OVERLAP = 0.88; // if step would be > this fraction of cardW, skip overlap

  let cardW = Math.min(containerH * ASPECT, MAX_CARD_W);

  // No overlap needed?
  if (N * cardW + (N - 1) * GAP <= containerW) {
    return { cardW, cardH: cardW / ASPECT, step: cardW + GAP };
  }

  const idealStep = (containerW - cardW) / (N - 1);

  // Overlap is tiny - shrink cards to fit cleanly without overlap instead
  if (idealStep >= cardW * TINY_OVERLAP) {
    cardW = (containerW - (N - 1) * GAP) / N;
    return { cardW, cardH: cardW / ASPECT, step: cardW + GAP };
  }

  // Real overlap - clamp to MIN_VISIBLE
  if (idealStep >= cardW * MIN_VISIBLE) {
    return { cardW, cardH: cardW / ASPECT, step: idealStep };
  }

  // Overlap too aggressive - shrink cards so MIN_VISIBLE fills the container
  cardW = containerW / (1 + MIN_VISIBLE * (N - 1));
  return { cardW, cardH: cardW / ASPECT, step: cardW * MIN_VISIBLE };
}

export function buildDealFanSlots(
  hand: Card[],
  options: {
    highlightedIndex?: number;
    slotLabel?: (index: number, card?: Card) => string;
  } = {}
): PlayCardFanSlot[] {
  const slotLabel =
    options.slotLabel ??
    ((index, card) =>
      card ? `Card ${index + 1}, revealed` : `Card ${index + 1}, hidden`);

  return Array.from({ length: SLOT_COUNT }, (_, index) => {
    const card = hand[index];
    return {
      ariaLabel: slotLabel(index, card),
      card,
      faceUp: Boolean(card),
      flipOnReveal: Boolean(card),
      highlighted: options.highlightedIndex === index,
    };
  });
}

export function buildBusFanSlots(
  visibleCards: Array<Card | null>,
  progressIndex: number,
  options: {
    slotLabel?: (index: number, progressIndex: number, card: Card | null) => string;
  } = {}
): PlayCardFanSlot[] {
  const slotLabel =
    options.slotLabel ??
    ((index, activeProgressIndex, card) => {
      const label = `Bus card ${index + 1}`;
      if (index < activeProgressIndex && card) return `${label}, revealed`;
      if (index === activeProgressIndex) return `${label}, current card`;
      return `${label}, hidden`;
    });

  return visibleCards.slice(0, SLOT_COUNT).map((card, index) => {
    const revealed = index < progressIndex;
    return {
      ariaLabel: slotLabel(index, progressIndex, card),
      card,
      faceUp: revealed,
      flipOnReveal: revealed && index === progressIndex - 1,
      highlighted: index === progressIndex,
    };
  });
}

export function PlayCardFanArea({
  fanClassName = '',
  shake = false,
  shakeKey,
  slots,
  stageClassName = 'overflow-hidden',
}: {
  fanClassName?: string;
  shake?: boolean;
  shakeKey?: string;
  slots: PlayCardFanSlot[];
  stageClassName?: string;
}) {
  return (
    <PlayCardStage className={stageClassName}>
      <PlayCardFan className={fanClassName} shake={shake} shakeKey={shakeKey} slots={slots} />
    </PlayCardStage>
  );
}

export function PlayCardFan({
  className = '',
  shake = false,
  shakeKey,
  slots,
}: {
  className?: string;
  shake?: boolean;
  shakeKey?: string;
  slots: PlayCardFanSlot[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [dims, setDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [tightLandscape, setTightLandscape] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setDims({ w: width, h: height });
      }
    };
    measure();
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setDims({ w: width, h: height });
      }
    });
    obs.observe(el);
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(measure);
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      obs.disconnect();
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(orientation: landscape) and (max-height: 500px) and (max-width: 950px)');
    const sync = () => setTightLandscape(query.matches);

    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const maxHighlightLift = tightLandscape ? 0 : 18;
  const fan = dims.w > 0 && dims.h > 0 ? computeFan(dims.w, Math.max(1, dims.h - maxHighlightLift)) : null;
  const totalFanW = fan ? fan.cardW + fan.step * 3 : 0;
  const highlightLift = fan ? Math.min(maxHighlightLift, fan.cardH * 0.06) : 0;
  const highlightHeadroom = highlightLift + (highlightLift > 0 ? 3 : 0);

  return (
    <div
      ref={containerRef}
      className={`deal-hand-frame flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-visible px-[clamp(0.25rem,2vw,1.5rem)] py-[clamp(0.4rem,2vh,1rem)] ${className}`}
    >
      {fan && (
        <motion.div
          key={shakeKey}
          className="relative flex-shrink-0"
          initial={false}
          animate={{
            width: totalFanW,
            height: fan.cardH + highlightHeadroom,
            x: shake && !reduceMotion ? [0, -7, 7, -4, 4, 0] : 0,
          }}
          transition={shake && !reduceMotion ? { duration: 0.34, ease: 'easeOut' } : playLayoutTransition}
        >
          {Array.from({ length: SLOT_COUNT }, (_, i) => {
            const slot = slots[i] ?? { faceUp: false };
            const highlighted = Boolean(slot.highlighted);
            return (
              <motion.div
                key={i}
                aria-label={slot.ariaLabel}
                className="absolute top-0"
                style={{ zIndex: i + (highlighted ? 10 : 0) }}
                initial={false}
                animate={{
                  left: i * fan.step,
                  top: highlightHeadroom + (highlighted ? -highlightLift : 0),
                  width: fan.cardW,
                  height: fan.cardH,
                  scale: highlighted ? 1.018 : 1,
                  rotate: 0,
                }}
                transition={playLayoutTransition}
              >
                <PlayCardSlot slot={slot} />
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

function PlayCardSlot({ slot }: { slot: PlayCardFanSlot }) {
  const { state } = useGame();
  const reduceMotion = useReducedMotion();

  if (!slot.card || !slot.faceUp) {
    return (
      <CardBack highlighted={slot.highlighted} id={state.cardBackId} size="fluid" />
    );
  }

  if (!slot.flipOnReveal) {
    return (
      <PlayingCard
        animateEntry={false}
        card={slot.card}
        highlighted={slot.highlighted}
        motionLayout={false}
        size="fluid"
      />
    );
  }

  return (
    <motion.div
      key={`${slot.card.id}-flip`}
      className="deal-card-flip h-full w-full"
      initial={{ rotateY: reduceMotion ? 180 : 0 }}
      animate={{ rotateY: 180 }}
      transition={reduceMotion ? { duration: 0.01 } : { ...playFadeTransition, duration: 0.28, ease: [0.2, 0.75, 0.25, 1] }}
    >
      <div className="deal-card-face">
        <CardBack id={state.cardBackId} size="fluid" />
      </div>
      <div className="deal-card-face deal-card-front">
        <PlayingCard
          animateEntry={false}
          card={slot.card}
          highlighted={slot.highlighted}
          motionLayout={false}
          size="fluid"
        />
      </div>
    </motion.div>
  );
}
