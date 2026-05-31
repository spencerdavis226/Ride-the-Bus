import type { GamePhase } from '../../game/state';

export type RulesPhase = 'deal' | 'table' | 'bus';

export type RulesScope = 'full' | 'context';

export const rulesPhases: RulesPhase[] = ['deal', 'table', 'bus'];

export const rulesPhaseLabels: Record<RulesPhase, string> = {
  deal: 'Deal',
  table: 'Table',
  bus: 'Bus',
};

export const rulesPhaseEyebrows: Record<RulesPhase, string> = {
  deal: 'The Deal',
  table: 'The Table',
  bus: 'The Bus',
};

export const dealSteps = [
  { step: 1, lines: ['Red / Black'] },
  { step: 2, lines: ['Higher / Lower', 'or Same'] },
  { step: 3, lines: ['Inside / Outside', 'or Same'] },
  { step: 4, lines: ['Suit'] },
] as const;

export type RuleCardContent = {
  text: string;
  tone?: 'correct' | 'incorrect' | 'neutral';
};

export type RulesPhaseContent = {
  goal: string;
  rules: RuleCardContent[];
};

export const rulesByPhase: Record<RulesPhase, RulesPhaseContent> = {
  deal: {
    goal: 'Guess every player\'s four cards.',
    rules: [
      { text: 'Right guess → Give drinks.', tone: 'correct' },
      { text: 'Wrong guess → Take drinks.', tone: 'incorrect' },
    ],
  },
  table: {
    goal: 'Flip 11 cards, row by row.',
    rules: [
      { text: 'Matching rank in someone\'s hand? It auto-plays that row.' },
      { text: 'Give drinks equal to the row number.' },
      { text: 'Most cards left → rides the bus together.' },
    ],
  },
  bus: {
    goal: 'Four correct guesses to escape.',
    rules: [
      { text: 'Call Same on card 2 or 3 → off immediately.', tone: 'correct' },
      { text: 'Miss → drinks and back to card 1.', tone: 'incorrect' },
      { text: 'Fresh 52-card deck (endless reshuffles when needed).' },
    ],
  },
};

export const aceFootnote = 'Aces are high — except on September 1st.';

export function resolveRulesPhase(phase: GamePhase): RulesPhase {
  if (phase === 'deal') return 'deal';
  if (phase === 'table') return 'table';
  return 'bus';
}
