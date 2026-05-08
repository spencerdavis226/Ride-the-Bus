import type { Card, Suit } from './cards';
import { suitGlyphs } from './cards';
import { calculatePhaseOneTwoDecks, createShoe, createStandardDeck, drawMany, drawOne, shuffleFisherYates } from './deck';
import { makeLog } from './log';
import { dealSubphaseLabels, nextDealPosition } from './phases';
import {
  busFailureUnits,
  scoreHigherLowerSame,
  scoreInsideOutsideSame,
  scoreRedBlack,
  scoreSuit,
  type ScoreResult
} from './scoring';
import {
  compareHigherLowerSame,
  compareInsideOutsideSame,
  type BusGuess,
  type HigherLowerSameGuess,
  type InsideOutsideSameGuess,
  type RedBlackGuess
} from './rules';
import type {
  AnimationSpeed,
  BusMode,
  BusPositionGuess,
  CardBackId,
  DealState,
  DrinkAssignment,
  GameState,
  Player,
  Settings,
  TableCard,
  TableMatchResult,
  TableState,
  ThemeId,
  ThemePreference
} from './state';

const themeIds: ThemeId[] = ['poker', 'coffee', 'picnic', 'lounge', 'kitchen'];
const cardBackIds: CardBackId[] = ['emerald', 'ivory', 'ruby', 'midnight', 'brass', 'plaid'];

export const defaultSettings: Settings = {
  playerNames: ['Player 1', 'Player 2', 'Player 3', 'Player 4'],
  busMode: 'singleDeck',
  animationSpeed: 'normal',
  themePreference: 'random'
};

export function createSetupState(settings: Settings = defaultSettings): GameState {
  const now = Date.now();
  return {
    phase: 'setup',
    players: namesToPlayers(settings.playerNames),
    settings,
    phaseOneTwoDecks: calculatePhaseOneTwoDecks(settings.playerNames.length),
    shoe: [],
    deal: { subphase: 'redBlack', playerIndex: 0, lastAssignment: null, awaitingContinue: false },
    table: emptyTable(),
    bus: null,
    gameOverReason: null,
    log: [],
    undo: null,
    theme: chooseTheme(settings.themePreference),
    cardBackId: chooseCardBack(),
    createdAt: now,
    updatedAt: now
  };
}

export function namesToPlayers(names: string[]): Player[] {
  return names.map((name, index) => ({
    id: `player-${index + 1}`,
    name: name.trim() || `Player ${index + 1}`,
    hand: []
  }));
}

export function startGame(settings: Settings, rng: () => number = Math.random): GameState {
  const playerNames = settings.playerNames.length >= 2 ? settings.playerNames : ['Player 1', 'Player 2'];
  const phaseOneTwoDecks = calculatePhaseOneTwoDecks(playerNames.length);
  const now = Date.now();
  return {
    phase: 'deal',
    players: namesToPlayers(playerNames),
    settings: { ...settings, playerNames },
    phaseOneTwoDecks,
    shoe: shuffleFisherYates(createShoe(phaseOneTwoDecks), rng),
    deal: { subphase: 'redBlack', playerIndex: 0, lastAssignment: null, awaitingContinue: false },
    table: emptyTable(),
    bus: null,
    gameOverReason: null,
    log: [makeLog(`Using ${phaseOneTwoDecks} deck${phaseOneTwoDecks === 1 ? '' : 's'} for this game.`, 'system')],
    undo: null,
    theme: chooseTheme(settings.themePreference, rng),
    cardBackId: chooseCardBack(rng),
    createdAt: now,
    updatedAt: now
  };
}

export function applyDealGuess(state: GameState, guess: BusGuess): GameState {
  if (state.deal.awaitingContinue) return state;
  const player = state.players[state.deal.playerIndex];
  const { card, deck } = drawOne(state.shoe);
  const score = scoreDealGuess(state.deal, player.hand, guess, card);
  const assignment = makeAssignment(player, score, 'deal');
  const players = state.players.map((candidate) =>
    candidate.id === player.id ? { ...candidate, hand: [...candidate.hand, card] } : candidate
  );
  const logText = `${player.name} guessed ${formatGuess(guess)}: ${score.correct ? 'correct' : 'wrong'}, ${assignment.label}`;
  return stamp({
    ...state,
    players,
    shoe: deck,
    deal: { ...state.deal, lastAssignment: assignment, awaitingContinue: true },
    log: [...state.log, makeLog(logText, 'deal')]
  });
}

export function continueDeal(state: GameState): GameState {
  if (!state.deal.awaitingContinue) return state;
  const position = nextDealPosition(state.deal.playerIndex, state.deal.subphase, state.players.length);
  if (!position.done) {
    return stamp({
      ...state,
      deal: { subphase: position.subphase, playerIndex: position.playerIndex, lastAssignment: null, awaitingContinue: false }
    });
  }

  const tableBuild = createTableFromShoe(state.shoe);
  return stamp({
    ...state,
    phase: 'table',
    shoe: tableBuild.shoe,
    table: tableBuild.table,
    deal: { ...state.deal, awaitingContinue: false },
    log: [...state.log, makeLog('The Table is ready.', 'table')]
  });
}

export function flipNextTableCard(state: GameState): GameState {
  const active = state.table.cards[state.table.activeIndex];
  if (!active || state.table.completed) return state;
  const matchResult = matchTableCard(state.players, active);
  const updatedCard: TableCard = {
    ...active,
    faceUp: true,
    matchedAssignments: matchResult.assignments
  };
  const cards = state.table.cards.map((card) => (card.id === active.id ? updatedCard : card));
  const nextIndex = state.table.activeIndex + 1;
  const completed = nextIndex >= cards.length;
  const summary = matchResult.assignments.length
    ? matchResult.assignments.map((assignment) => assignment.label).join(', ')
    : `No matches on ${active.card.rank}.`;
  const nextState: GameState = stamp({
    ...state,
    players: matchResult.players,
    table: { cards, activeIndex: nextIndex, completed },
    log: [...state.log, makeLog(`Table ${active.card.rank} on Row ${active.row}: ${summary}`, 'table')]
  });
  return completed ? advanceAfterTable(nextState) : nextState;
}

export function determineBusRiders(players: Player[]): Player[] {
  const highest = Math.max(...players.map((player) => player.hand.length));
  if (highest === 0) return [];
  return players.filter((player) => player.hand.length === highest);
}

export function startBus(state: GameState, rng: () => number = Math.random): GameState {
  const riders = determineBusRiders(state.players);
  if (!riders.length) {
    return stamp({
      ...state,
      phase: 'gameOver',
      gameOverReason: 'emptyBus',
      bus: null,
      log: [...state.log, makeLog('No one rides. The bus left empty.', 'bus')]
    });
  }
  const busDeck = shuffleFisherYates(createStandardDeck(1), rng);
  const drawn = drawMany(busDeck, 4);
  return stamp({
    ...state,
    phase: 'bus',
    bus: {
      riders,
      deck: drawn.deck,
      visibleCards: drawn.cards,
      progressIndex: 0,
      drinksEach: 0,
      exhausted: false,
      escaped: false,
      reshuffleCount: 0,
      lastAssignment: null
    },
    log: [...state.log, makeLog(`${riders.map((rider) => rider.name).join(', ')} ride${riders.length === 1 ? 's' : ''} the bus.`, 'bus')]
  });
}

export function applyBusGuess(state: GameState, guess: BusGuess, rng: () => number = Math.random): GameState {
  if (!state.bus || state.bus.exhausted || state.bus.escaped) return state;
  const positionIndex = state.bus.progressIndex;
  const activeGuess = { positionIndex, guess } as BusPositionGuess;
  const result = scoreBusGuess(state.bus.visibleCards, activeGuess);
  if (result.correct) {
    const nextProgress = (positionIndex + 1) as 0 | 1 | 2 | 3 | 4;
    const escaped = nextProgress === 4;
    return stamp({
      ...state,
      phase: escaped ? 'gameOver' : 'bus',
      gameOverReason: escaped ? 'escaped' : state.gameOverReason,
      bus: {
        ...state.bus,
        progressIndex: nextProgress,
        escaped
      },
      log: [...state.log, makeLog(`Bus card ${positionIndex + 1}: correct.`, 'bus'), ...(escaped ? [makeLog('The riders escaped the bus.', 'bus')] : [])]
    });
  }

  const units = busFailureUnits(positionIndex, result.actual, guess === 'same');
  const assignment: DrinkAssignment = {
    playerId: 'bus-riders',
    playerName: 'Riders',
    direction: 'take',
    units,
    source: 'bus',
    label: `Riders: Take ${units} each`
  };
  const replacement = replaceBusCards(state.bus.visibleCards, state.bus.deck, positionIndex + 1, state.settings.busMode, rng);
  const drinksEach = state.bus.drinksEach + units;
  const exhausted = replacement.exhausted;
  return stamp({
    ...state,
    phase: exhausted ? 'gameOver' : 'bus',
    gameOverReason: exhausted ? 'deckExhausted' : state.gameOverReason,
    bus: {
      ...state.bus,
      visibleCards: replacement.visibleCards,
      deck: replacement.deck,
      progressIndex: 0,
      drinksEach,
      exhausted,
      reshuffleCount: state.bus.reshuffleCount + replacement.reshuffles,
      lastAssignment: assignment
    },
    log: [
      ...state.log,
      makeLog(`Bus failed on card ${positionIndex + 1}: riders Take ${units} each.`, 'bus'),
      makeLog(`Bus total is ${drinksEach} drinks each.`, 'bus')
    ]
  });
}

export function matchTableCard(players: Player[], tableCard: TableCard): TableMatchResult {
  const assignments: DrinkAssignment[] = [];
  const updatedPlayers = players.map((player) => {
    const matchingCards = player.hand.filter((card) => card.numericValue === tableCard.card.numericValue);
    if (!matchingCards.length) return player;
    matchingCards.forEach(() => {
      assignments.push({
        playerId: player.id,
        playerName: player.name,
        direction: 'give',
        units: tableCard.value,
        source: 'table',
        label: `${player.name}: Give ${tableCard.value}`
      });
    });
    return {
      ...player,
      hand: player.hand.filter((card) => card.numericValue !== tableCard.card.numericValue)
    };
  });
  return { players: updatedPlayers, assignments };
}

export function replaceBusCards(
  visibleCards: Array<Card | null>,
  deck: Card[],
  replaceCount: number,
  mode: BusMode,
  rng: () => number = Math.random
): { visibleCards: Array<Card | null>; deck: Card[]; exhausted: boolean; reshuffles: number } {
  let workingDeck = deck;
  let reshuffles = 0;
  if (workingDeck.length < replaceCount) {
    if (mode === 'singleDeck') {
      const cleared = visibleCards.map((card, index) => (index < replaceCount ? null : card));
      return { visibleCards: cleared, deck: workingDeck, exhausted: true, reshuffles };
    }
    workingDeck = shuffleFisherYates(createStandardDeck(1), rng);
    reshuffles = 1;
  }
  const drawn = drawMany(workingDeck, replaceCount);
  const nextVisible = visibleCards.map((card, index) => (index < replaceCount ? drawn.cards[index] : card));
  return { visibleCards: nextVisible, deck: drawn.deck, exhausted: false, reshuffles };
}

export function createTableFromShoe(shoe: Card[]): { table: TableState; shoe: Card[] } {
  const drawn = drawMany(shoe, 11);
  const rows: Array<{ row: 1 | 2 | 3 | 4 | 5; count: number; value: 1 | 2 | 3 | 4 | 5 }> = [
    { row: 1, count: 1, value: 1 },
    { row: 2, count: 4, value: 2 },
    { row: 3, count: 3, value: 3 },
    { row: 4, count: 2, value: 4 },
    { row: 5, count: 1, value: 5 }
  ];
  let cardIndex = 0;
  const cards = rows.flatMap((row) =>
    Array.from({ length: row.count }, () => {
      const card = drawn.cards[cardIndex];
      cardIndex += 1;
      return {
        id: `table-${card.id}`,
        row: row.row,
        value: row.value,
        card,
        faceUp: false,
        matchedAssignments: []
      } satisfies TableCard;
    })
  );
  return {
    table: { cards, activeIndex: 0, completed: false },
    shoe: drawn.deck
  };
}

function scoreDealGuess(deal: DealState, hand: Card[], guess: BusGuess, card: Card): ScoreResult {
  if (deal.subphase === 'redBlack') return scoreRedBlack(guess as RedBlackGuess, card);
  if (deal.subphase === 'higherLowerSame') return scoreHigherLowerSame(guess as HigherLowerSameGuess, hand[0], card);
  if (deal.subphase === 'insideOutsideSame') return scoreInsideOutsideSame(guess as InsideOutsideSameGuess, hand[0], hand[1], card);
  return scoreSuit(guess as Suit, card);
}

function scoreBusGuess(visibleCards: Array<Card | null>, busGuess: BusPositionGuess): ScoreResult {
  const card = visibleCards[busGuess.positionIndex];
  if (!card) throw new Error('Cannot guess against an empty bus slot');
  if (busGuess.positionIndex === 0) return scoreRedBlack(busGuess.guess, card);
  if (busGuess.positionIndex === 1) {
    const previous = visibleCards[0];
    if (!previous) throw new Error('Missing previous bus card');
    return scoreHigherLowerSame(busGuess.guess, previous, card);
  }
  if (busGuess.positionIndex === 2) {
    const first = visibleCards[0];
    const second = visibleCards[1];
    if (!first || !second) throw new Error('Missing previous bus cards');
    return scoreInsideOutsideSame(busGuess.guess, first, second, card);
  }
  return scoreSuit(busGuess.guess, card);
}

function makeAssignment(player: Player, score: ScoreResult, source: 'deal' | 'table' | 'bus'): DrinkAssignment {
  const action = score.direction === 'give' ? 'Give' : 'Take';
  return {
    playerId: player.id,
    playerName: player.name,
    direction: score.direction,
    units: score.units,
    source,
    label: `${player.name}: ${action} ${score.units}`
  };
}

function advanceAfterTable(state: GameState): GameState {
  const riders = determineBusRiders(state.players);
  if (!riders.length) {
    return stamp({
      ...state,
      phase: 'gameOver',
      gameOverReason: 'emptyBus',
      log: [...state.log, makeLog('No one rides. The bus left empty.', 'bus')]
    });
  }
  return stamp({
    ...state,
    phase: 'busIntro',
    log: [...state.log, makeLog(`${riders.map((rider) => rider.name).join(', ')} will ride the bus.`, 'bus')]
  });
}

function emptyTable(): TableState {
  return { cards: [], activeIndex: 0, completed: false };
}

function chooseTheme(preference: ThemePreference, rng: () => number = Math.random): ThemeId {
  if (preference !== 'random') return preference;
  return themeIds[Math.floor(rng() * themeIds.length)] ?? 'poker';
}

function chooseCardBack(rng: () => number = Math.random): CardBackId {
  return cardBackIds[Math.floor(rng() * cardBackIds.length)] ?? 'emerald';
}

function stamp(state: GameState): GameState {
  return { ...state, updatedAt: Date.now() };
}

function formatGuess(guess: BusGuess): string {
  if (guess === 'spades' || guess === 'hearts' || guess === 'diamonds' || guess === 'clubs') {
    return suitGlyphs[guess];
  }
  return `${guess[0].toUpperCase()}${guess.slice(1)}`;
}
