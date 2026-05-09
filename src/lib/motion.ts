import { useReducedMotion } from 'framer-motion';
import type { Transition, Variants } from 'framer-motion';

// ─── Spring presets ───────────────────────────────────────────────────────────

export const springs = {
  // Scene content slide-up (all 4 game scenes + GameOver)
  sceneEntry:    { type: 'spring', damping: 26, stiffness: 260 } as Transition,
  // Action-zone guess picker appearance (slightly crisper)
  guessPicker:   { type: 'spring', damping: 24, stiffness: 290 } as Transition,
  // Card highlight lift (snappiest — direct tactile feedback)
  cardHighlight: { type: 'spring', damping: 30, stiffness: 340 } as Transition,
  // Overlay / modal panel scale (softer, more dramatic)
  overlay:       { type: 'spring', damping: 22, stiffness: 330 } as Transition,
  // Bottom-sheet drawer slide
  drawer:        { type: 'spring', damping: 32, stiffness: 360 } as Transition,
  // Table carousel card positions
  carousel:      { type: 'spring', damping: 30, stiffness: 260 } as Transition,
} as const;

// Instant transition used when reduced motion is preferred
const instant: Transition = { duration: 0.01 };

// ─── Shared Framer Motion variants ───────────────────────────────────────────

// Scene felt content — slide up from below with subtle scale pop
export const sceneEntryVariants: Variants = {
  hidden:  { y: 18, scale: 0.985, opacity: 0 },
  visible: { y: 0,  scale: 1,     opacity: 1 },
  exit:    { y: -14, scale: 0.985, opacity: 0 }, // BusScreen uses the exit key
};

// Reduced-motion-safe version (no translate/scale — only opacity)
const sceneEntryReduced: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
  exit:    { opacity: 0 },
};

// Deal outcome feedback: correct gets a scale pop, wrong gets a micro-shake
export const dealOutcomeVariants = {
  correct: {
    hidden:  { opacity: 0, scale: 0.88 },
    visible: { opacity: 1, scale: 1 },
    exit:    { opacity: 0, scale: 0.92 },
  } satisfies Variants,
  wrong: {
    hidden:  { opacity: 0, x: 0 },
    visible: { opacity: 1, x: [0, -6, 5, -4, 3, 0] }, // keyframe waggle
    exit:    { opacity: 0 },
  } satisfies Variants,
};

const dealOutcomeReduced = {
  correct: { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } } satisfies Variants,
  wrong:   { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } } satisfies Variants,
};

// Action-zone button swap (guess picker ↔ Next button)
export const actionZoneVariants: Variants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
  exit:    { opacity: 0 },
};

const actionZoneReduced: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
  exit:    { opacity: 0 },
};

// Generic fade (safe at any motion level — no translate/scale)
export const fadedVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
  exit:    { opacity: 0 },
};

// ─── useMotion hook ───────────────────────────────────────────────────────────
// Single callsite for useReducedMotion across the entire app.
// Every scene imports this instead of calling useReducedMotion() directly.

export function useMotion() {
  const reduced = useReducedMotion() ?? false;

  return {
    reduced,
    springs:     reduced ? { ...Object.fromEntries(Object.keys(springs).map((k) => [k, instant])) } as typeof springs : springs,
    sceneEntry:  reduced ? sceneEntryReduced  : sceneEntryVariants,
    dealOutcome: reduced ? dealOutcomeReduced : dealOutcomeVariants,
    actionZone:  reduced ? actionZoneReduced  : actionZoneVariants,
    faded:       fadedVariants, // opacity is always safe
  };
}
