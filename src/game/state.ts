import type { Card, Suit } from './cards';
import type { DealSubphase } from './phases';
import type { BusGuess } from './rules';
import type { GameLogEntry } from './log';

export type GamePhase = 'setup' | 'deal' | 'table' | 'busIntro' | 'bus' | 'gameOver';
export type BusMode = 'singleDeck' | 'endless';
export type ThemeId =
  | 'poker'
  | 'coffee'
  | 'picnic'
  | 'lounge'
  | 'kitchen'
  | 'velvet'
  | 'ocean'
  | 'copper'
  | 'midnight'
  | 'garden';
export type CardBackId =
  | 'emerald'
  | 'ivory'
  | 'ruby'
  | 'midnight'
  | 'brass'
  | 'plaid'
  | 'obsidian'
  | 'sapphire'
  | 'amethyst'
  | 'jade'
  | 'cherry'
  | 'carbon'
  | 'casino'
  | 'sunset'
  | 'frost'
  | 'moss'
  | 'pearl'
  | 'royal'
  | 'ember'
  | 'mint'
  | 'grape'
  | 'slate'
  | 'rose'
  | 'lagoon'
  | 'whiskey'
  | 'noir'
  | 'coral'
  | 'linen'
  | 'orchid'
  | 'cobalt';
export type ThemePreference = 'random' | ThemeId;

export type Player = {
  id: string;
  name: string;
  hand: Card[];
};

export type Settings = {
  playerNames: string[];
  busMode: BusMode;
  themePreference: ThemePreference;
};

export type DrinkAssignment = {
  playerId: string;
  playerName: string;
  direction: 'give' | 'take';
  units: number;
  source: 'deal' | 'table' | 'bus';
  label: string;
};

export type DealResult = {
  guess: BusGuess;
  actual: string;
  correct: boolean;
};

export type DealState = {
  subphase: DealSubphase;
  playerIndex: number;
  lastAssignment: DrinkAssignment | null;
  lastResult: DealResult | null;
  awaitingContinue: boolean;
};

export type TableCard = {
  id: string;
  row: 1 | 2 | 3 | 4 | 5;
  value: 1 | 2 | 3 | 4 | 5;
  card: Card;
  faceUp: boolean;
  matchedAssignments: DrinkAssignment[];
};

export type TableState = {
  cards: TableCard[];
  activeIndex: number;
  completed: boolean;
};

export type BusState = {
  riders: Player[];
  deck: Card[];
  visibleCards: Array<Card | null>;
  progressIndex: 0 | 1 | 2 | 3 | 4;
  drinksEach: number;
  exhausted: boolean;
  escaped: boolean;
  reshuffleCount: number;
  lastAssignment: DrinkAssignment | null;
};

export type GameOverReason = 'escaped' | 'emptyBus' | 'deckExhausted';

export type GameState = {
  phase: GamePhase;
  players: Player[];
  settings: Settings;
  phaseOneTwoDecks: number;
  shoe: Card[];
  deal: DealState;
  table: TableState;
  bus: BusState | null;
  gameOverReason: GameOverReason | null;
  log: GameLogEntry[];
  undo: UndoSnapshot | null;
  theme: ThemeId;
  cardBackId: CardBackId;
  createdAt: number;
  updatedAt: number;
};

export type UndoSnapshot = Omit<GameState, 'undo'>;

export type TableMatchResult = {
  players: Player[];
  assignments: DrinkAssignment[];
};

export type BusPositionGuess =
  | { positionIndex: 0; guess: 'red' | 'black' }
  | { positionIndex: 1; guess: 'higher' | 'lower' | 'same' }
  | { positionIndex: 2; guess: 'inside' | 'outside' | 'same' }
  | { positionIndex: 3; guess: Suit };
