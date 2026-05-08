export type DealSubphase = 'redBlack' | 'higherLowerSame' | 'insideOutsideSame' | 'suit';

export const dealSubphases: DealSubphase[] = ['redBlack', 'higherLowerSame', 'insideOutsideSame', 'suit'];

export const dealSubphaseLabels: Record<DealSubphase, string> = {
  redBlack: 'Red or Black',
  higherLowerSame: 'Higher, Lower, or Same',
  insideOutsideSame: 'Inside, Outside, or Same',
  suit: 'Suit'
};

export function nextDealPosition(
  playerIndex: number,
  subphase: DealSubphase,
  playerCount: number
): { playerIndex: number; subphase: DealSubphase; done: boolean } {
  const subphaseIndex = dealSubphases.indexOf(subphase);
  if (playerIndex + 1 < playerCount) {
    return { playerIndex: playerIndex + 1, subphase, done: false };
  }
  const nextSubphase = dealSubphases[subphaseIndex + 1];
  if (!nextSubphase) {
    return { playerIndex: 0, subphase, done: true };
  }
  return { playerIndex: 0, subphase: nextSubphase, done: false };
}
