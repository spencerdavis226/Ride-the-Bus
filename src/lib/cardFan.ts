export type FanLayout = { cardW: number; cardH: number; step: number };

/**
 * Calculates the optimal card fan layout for a given container size.
 * Cards maintain a 5:7 aspect ratio and overlap gracefully when space is tight.
 */
export function computeFan(
  containerW: number,
  containerH: number,
  opts?: { cardCount?: number },
): FanLayout {
  const N = opts?.cardCount ?? 4;
  const ASPECT = 5 / 7;
  const GAP = Math.max(8, Math.min(18, containerW * 0.02));
  const MAX_CARD_W = 340;
  const MIN_VISIBLE = 0.42; // min fraction visible on non-last cards when overlapping
  const TINY_OVERLAP = 0.88; // if step would be > this fraction of cardW, skip overlap

  let cardW = Math.min(containerH * ASPECT, MAX_CARD_W);

  // All cards fit without overlap
  if (N * cardW + (N - 1) * GAP <= containerW) {
    return { cardW, cardH: cardW / ASPECT, step: cardW + GAP };
  }

  const idealStep = (containerW - cardW) / (N - 1);

  // Overlap would be negligible — shrink cards to fit cleanly instead
  if (idealStep >= cardW * TINY_OVERLAP) {
    cardW = (containerW - (N - 1) * GAP) / N;
    return { cardW, cardH: cardW / ASPECT, step: cardW + GAP };
  }

  // Overlap is acceptable — clamp to MIN_VISIBLE fraction
  if (idealStep >= cardW * MIN_VISIBLE) {
    return { cardW, cardH: cardW / ASPECT, step: idealStep };
  }

  // Overlap too aggressive — shrink cards so MIN_VISIBLE fills the container
  cardW = containerW / (1 + MIN_VISIBLE * (N - 1));
  return { cardW, cardH: cardW / ASPECT, step: cardW * MIN_VISIBLE };
}
