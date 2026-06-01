import type { Card, Suit } from './cards';
import { suitGlyphs } from './cards';
import { calculatePhaseOneTwoDecks, createShoe, createStandardDeck, drawMany, drawOne, shuffleFisherYates } from './deck';
import { makeLog, tableHitTitle } from './log';
import { getPlayerDisplayName, normalizePlayerNames } from './playerNames';
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
  cardNumericValue,
  compareHigherLowerSame,
  compareInsideOutsideSame,
  type BusGuess,
  type HigherLowerSameGuess,
  type InsideOutsideSameGuess,
  type RedBlackGuess
} from './rules';
import type {
  BusMode,
  BusPositionGuess,
  CardBackId,
  DealResult,
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
import { isThemeId, themeIds } from '../styles/themes';

export const cardBackIdsByTheme: Record<ThemeId, CardBackId[]> = {
  poker: ['emerald', 'ivory', 'ruby', 'brass', 'casino'],
  dark: ['midnight', 'sapphire', 'amethyst', 'jade', 'carbon'],
  blackout: ['obsidian', 'noir', 'slate', 'smoke', 'sage'],
  light: ['frost', 'pearl', 'linen', 'sky', 'glass'],
  summer: ['mint', 'lagoon', 'coral', 'sunset', 'citrus'],
  autumn: ['moss', 'ember', 'whiskey', 'plaid', 'copper'],
  winter: ['royal', 'cobalt', 'glacier', 'aurora', 'lavender'],
  spring: ['cherry', 'grape', 'rose', 'orchid', 'meadow'],
};

const TAUNT_CHANCE = 0.05;

const dealTauntTemplates = [
  '{name}, dogshit guess.',
  '{name}, fucking brutal.',
  '{name}, trash read.',
  '{name}, humiliating.',
  '{name}, wildly stupid.',
  '{name}, garbage instincts.',
  '{name}, sit there and drink.',
  '{name}, the cards despise you.',
  '{name}, embarrassing.',
  '{name}, clown-level miss.',
  '{name}, zero dignity.',
  '{name}, unforgivable read.',
  '{name}, delete that instinct.',
  '{name}, tragic little guess.',
  '{name}, shameful work.',
  '{name}, absolutely cooked.',
  '{name}, no thoughts detected.',
  '{name}, spectacularly wrong.',
  '{name}, miserable choice.',
  '{name}, drink for that nonsense.',
  '{name}, deeply unserious.',
  '{name}, the table noticed.',
  '{name}, awful in public.',
  '{name}, pure card cowardice.',
  '{name}, an intellectual crime.',
  '{name}, retire immediately.',
  '{name}, breathtakingly bad.',
  '{name}, wipe that confidence off.',
  '{name}, confidently useless.',
  '{name}, full-body embarrassment.',
  '{name}, the deck owns you.',
  '{name}, piss-poor read.',
  '{name}, tragic card sense.',
  '{name}, a real low point.',
  '{name}, deeply cursed guess.',
  '{name}, drink and reflect.',
  '{name}, terrible little moment.',
  '{name}, your hunch sucks.',
  '{name}, brutal self-own.',
  '{name}, absolute guess rot.',
  '{name}, zero card literacy.',
  '{name}, pathetic read.',
  '{name}, the room got dumber.',
  '{name}, ugly guess.',
  '{name}, stay away from casinos.',
  '{name}, devastatingly dumb.',
  '{name}, cursed decision.',
  '{name}, no business guessing.',
  '{name}, just awful.',
  '{name}, elite-level failure.',
  '{name}, piss away another drink.',
  '{name}, shame on your instincts.',
  '{name}, complete confidence scam.',
  '{name}, deeply embarrassing.',
  '{name}, what a disaster.',
  '{name}, abysmal.',
  '{name}, savage miss.',
  '{name}, nasty little failure.',
  '{name}, this is why you drink.',
  '{name}, your gut is bankrupt.',
  '{name}, horrendous.',
  '{name}, stop trusting yourself.',
  '{name}, the card laughed.',
  '{name}, brutal incompetence.',
  '{name}, pure failure energy.',
  '{name}, ugly business.',
  '{name}, unforgivably off.',
  '{name}, garbage call.',
  '{name}, impressively bad.',
  '{name}, the deck humiliated you.',
  '{name}, trash-tier instinct.',
  '{name}, painful to watch.',
  '{name}, no redemption there.',
  '{name}, drink for the audacity.',
  '{name}, hostile to logic.',
  '{name}, a terrible idea.',
  '{name}, fully exposed.',
  '{name}, absolutely no sauce.',
  '{name}, catastrophic read.',
  '{name}, your confidence is fraud.',
  '{name}, sad little miss.',
  '{name}, not even close.',
  '{name}, cursed by incompetence.',
  '{name}, drink for being wrong.',
  '{name}, an ugly collapse.',
  '{name}, bad and loud.',
  '{name}, truly foul work.',
  '{name}, peak wrongness.',
  '{name}, embarrassing instincts.',
  '{name}, zero clutch.',
  '{name}, drink through the shame.',
  '{name}, the table rejects you.',
  '{name}, no card sense.',
  '{name}, wretched guess.',
  '{name}, breathtaking failure.',
  '{name}, aggressively wrong.',
  '{name}, pure nonsense.',
  '{name}, spectacular collapse.',
  '{name}, filthy miss.',
  '{name}, disgraceful read.'
];

const busTauntTemplates = [
  'Bus full of idiots.',
  'Group failure.',
  'Pathetic.',
  'Absolute clown bus.',
  'You all deserve this.',
  'Disaster-class guessing.',
  'Everyone looked stupid there.',
  'Brutal miss.',
  'The bus is judging you.',
  'Collective dumpster fire.',
  'Whole bus, zero dignity.',
  'Teamwork, but embarrassing.',
  'Riders got exposed.',
  'Trash bus behavior.',
  'Group shame.',
  'That was communal failure.',
  'The bus smells weakness.',
  'All aboard the shame bus.',
  'Collective card blindness.',
  'Failures, all of you.',
  'Nobody looked smart there.',
  'Riders, fully cooked.',
  'Public group humiliation.',
  'That was ugly.',
  'Bus confidence bankrupt.',
  'Sit there and reflect.',
  'The bus chose violence.',
  'Everyone failed together.',
  'Brutal group collapse.',
  'Riders got rinsed.',
  'Bus full of bad ideas.',
  'That read was cursed.',
  'Group instincts: trash.',
  'No appeals.',
  'The bus got humbled.',
  'Collective nonsense.',
  'Everyone wears that.',
  'Peak bus stupidity.',
  'Riders, get wrecked.',
  'That was shameful.',
  'The bus has no sauce.',
  'Arrogance punished.',
  'Group read: garbage.',
  'Everyone looked cooked.',
  'The deck owns this bus.',
  'Riders got embarrassed.',
  'Trash bus behavior.',
  'Obviously deserved.',
  'This bus is cursed.',
  'Collective confidence scam.',
  'That miss was filthy.',
  'Bus got bodied.',
  'Group failure era.',
  'The riders fumbled hard.',
  'Deeply deserved.',
  'Bus full of regret.',
  'That was pure garbage.',
  'Everyone sit in shame.',
  'Riders, pathetic.',
  'The table witnessed that.',
  'Incompetence tax.',
  'Collective faceplant.',
  'Bus read was rancid.',
  'Whole bus got cooked.',
  'The riders are unserious.',
  'Group dignity deleted.',
  'Learn nothing, apparently.',
  'Absolutely tragic bus.',
  'Everyone guessed like trash.',
  'The bus failed loudly.',
  'Riders, no redemption.',
  'Collective brain-off moment.',
  'That was vile.',
  'Clowns, all of you.',
  'The bus deserves this.',
  'Group instincts bankrupt.',
  'Everyone wear that shame.',
  'Bus got humiliated.',
  'Wrong with confidence.',
  'Brutal.',
  'The riders are cooked.',
  'Group collapse.',
  'Bus read was criminal.',
  'Everyone caught the L.',
  'That mess was yours.',
  'Collective disaster.',
  'The bus chose wrong.',
  'Riders got flattened.',
  'Group judgment denied.',
  'Absolutely foul guess.',
  'No sympathy.',
  'The bus is a mistake.',
  'Everyone looked fraudulent.',
  'Riders, hideous work.',
  'Collective trash fire.',
  'Shut up and wear it.',
  'That was catastrophic.',
  'Bus full of bad reads.',
  'Everyone lost aura.',
  'Collective collapse.'
];

export const wrongGuessTauntTemplateCounts = {
  deal: dealTauntTemplates.length,
  bus: busTauntTemplates.length
} as const;

export const defaultSettings: Settings = {
  playerNames: ['', ''],
  busMode: 'singleDeck',
  themePreference: 'poker'
};

export function createSetupState(settings: Settings = defaultSettings): GameState {
  const playerNames = normalizePlayerNames(settings.playerNames);
  const normalizedSettings = { ...settings, playerNames };
  const theme = chooseTheme(settings.themePreference);
  const now = Date.now();
  return {
    phase: 'setup',
    players: namesToPlayers(playerNames),
    settings: normalizedSettings,
    phaseOneTwoDecks: calculatePhaseOneTwoDecks(playerNames.length),
    shoe: [],
    deal: { subphase: 'redBlack', playerIndex: 0, lastAssignment: null, lastResult: null, awaitingContinue: false },
    table: emptyTable(),
    bus: null,
    gameOverReason: null,
    log: [],
    undo: null,
    theme,
    cardBackId: chooseCardBack(theme),
    createdAt: now,
    updatedAt: now
  };
}

export function namesToPlayers(names: string[]): Player[] {
  return names.map((name, index) => ({
    id: `player-${index + 1}`,
    name: getPlayerDisplayName(name, index),
    hand: []
  }));
}

export function startGame(settings: Settings, rng: () => number = Math.random): GameState {
  const playerNames = normalizePlayerNames(settings.playerNames.length >= 2 ? settings.playerNames : ['', '']);
  const phaseOneTwoDecks = calculatePhaseOneTwoDecks(playerNames.length);
  const shoe = shuffleFisherYates(createShoe(phaseOneTwoDecks), rng);
  const theme = chooseTheme(settings.themePreference, rng);
  const cardBackId = chooseCardBack(theme, rng);
  const now = Date.now();
  return {
    phase: 'deal',
    players: namesToPlayers(playerNames),
    settings: { ...settings, playerNames },
    phaseOneTwoDecks,
    shoe,
    deal: { subphase: 'redBlack', playerIndex: 0, lastAssignment: null, lastResult: null, awaitingContinue: false },
    table: emptyTable(),
    bus: null,
    gameOverReason: null,
    log: [
      makeLog(`Using ${phaseOneTwoDecks} deck${phaseOneTwoDecks === 1 ? '' : 's'} for this game.`, 'system', {
        title: 'Game started',
        detail: `${phaseOneTwoDecks} deck${phaseOneTwoDecks === 1 ? '' : 's'}`,
        result: 'neutral'
      })
    ],
    undo: null,
    theme,
    cardBackId,
    createdAt: now,
    updatedAt: now
  };
}

function gameOverDeckExhausted(state: GameState): GameState {
  return stamp({
    ...state,
    phase: 'gameOver',
    gameOverReason: 'deckExhausted',
    log: [
      ...state.log,
      makeLog('The deck ran out before the game could continue.', 'system', {
        title: 'Deck exhausted',
        result: 'neutral'
      })
    ]
  });
}

export function applyDealGuess(state: GameState, guess: BusGuess, rng: () => number = Math.random): GameState {
  if (state.phase !== 'deal') return state;
  if (state.deal.awaitingContinue) return state;
  if (!state.shoe.length) return gameOverDeckExhausted(state);
  const player = state.players[state.deal.playerIndex];
  const { card, deck } = drawOne(state.shoe);
  const score = scoreDealGuess(state.deal, player.hand, guess, card);
  const assignment = makeAssignment(player, score, 'deal');
  const taunt = wrongGuessTaunt(score.correct, dealTauntTemplates, rng, {
    name: player.name,
    units: assignment.units
  });
  const players = state.players.map((candidate) =>
    candidate.id === player.id ? { ...candidate, hand: [...candidate.hand, card] } : candidate
  );
  const logText = `${player.name} guessed ${formatGuess(guess)}: ${score.correct ? 'correct' : 'wrong'}, ${assignment.label}`;
  return stamp({
    ...state,
    players,
    shoe: deck,
    deal: {
      ...state.deal,
      lastAssignment: assignment,
      lastResult: { guess, actual: score.actual, correct: score.correct, ...(taunt ? { taunt } : {}) },
      awaitingContinue: true
    },
    log: [
      ...state.log,
      makeLog(logText, 'deal', {
        title: `${player.name} ${assignment.direction === 'take' ? 'owes' : 'gives'} ${assignment.units}`,
        detail: `${formatGuess(guess)} was ${score.correct ? 'right' : 'wrong'}: ${formatCard(card)}`,
        assignments: [assignment],
        cardLabel: formatCard(card),
        result: score.correct ? 'correct' : 'wrong'
      })
    ]
  });
}

export function continueDeal(state: GameState): GameState {
  if (state.phase !== 'deal') return state;
  if (!state.deal.awaitingContinue) return state;
  const position = nextDealPosition(state.deal.playerIndex, state.deal.subphase, state.players.length);
  if (!position.done) {
    return stamp({
      ...state,
      deal: {
        subphase: position.subphase,
        playerIndex: position.playerIndex,
        lastAssignment: null,
        lastResult: null,
        awaitingContinue: false
      }
    });
  }

  if (state.shoe.length < 11) return gameOverDeckExhausted(state);
  const tableBuild = createTableFromShoe(state.shoe);
  return stamp({
    ...state,
    phase: 'table',
    shoe: tableBuild.shoe,
    table: tableBuild.table,
    deal: { ...state.deal, lastResult: null, awaitingContinue: false },
    log: [...state.log, makeLog('The Table is ready.', 'table', { title: 'Table ready', result: 'neutral' })]
  });
}

export function flipNextTableCard(state: GameState): GameState {
  if (state.phase !== 'table') return state;
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
    log: [
      ...state.log,
      makeLog(`Table ${active.card.rank} on Row ${active.row}: ${summary}`, 'table', {
        title: tableHitTitle(matchResult.assignments),
        detail: `Row ${active.row}: ${formatCard(active.card)}`,
        assignments: matchResult.assignments,
        cardLabel: formatCard(active.card),
        result: 'neutral'
      })
    ]
  });
  return completed ? advanceAfterTable(nextState) : nextState;
}

export function determineBusRiders(players: Player[]): Player[] {
  const highest = Math.max(...players.map((player) => player.hand.length));
  if (highest === 0) return [];
  return players.filter((player) => player.hand.length === highest);
}

export function startBus(state: GameState, rng: () => number = Math.random): GameState {
  if (state.phase !== 'busIntro') return state;
  const riders = determineBusRiders(state.players);
  if (!riders.length) {
    return stamp({
      ...state,
      phase: 'gameOver',
      gameOverReason: 'emptyBus',
      bus: null,
      log: [...state.log, makeLog('No one rides. The bus left empty.', 'bus', { title: 'No one rides', result: 'neutral' })]
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
      escapedViaSame: false,
      reshuffleCount: 0,
      lastAssignment: null,
      lastResult: null,
      awaitingContinue: false
    },
    log: [
      ...state.log,
      makeLog(`${riders.map((rider) => rider.name).join(', ')} ride${riders.length === 1 ? 's' : ''} the bus.`, 'bus', {
        title: `${riders.length === 1 ? riders[0].name : `${riders.length} riders`} on the bus`,
        detail: riders.map((rider) => rider.name).join(', '),
        result: 'neutral'
      })
    ]
  });
}

export function busEscapesOnCorrectContinue(positionIndex: number, lastResult: DealResult): boolean {
  const viaSame = lastResult.guess === 'same' && (positionIndex === 1 || positionIndex === 2);
  const viaFullRun = positionIndex + 1 === 4;
  return viaSame || viaFullRun;
}

export function applyBusGuess(state: GameState, guess: BusGuess, rng: () => number = Math.random): GameState {
  if (state.phase !== 'bus') return state;
  if (!state.bus || state.bus.exhausted || state.bus.escaped || state.bus.awaitingContinue) return state;
  const positionIndex = state.bus.progressIndex;
  const activeGuess = { positionIndex, guess } as BusPositionGuess;
  const score = scoreBusGuess(state.bus.visibleCards, activeGuess);
  const card = state.bus.visibleCards[positionIndex]!;

  if (score.correct) {
    return stamp({
      ...state,
      bus: {
        ...state.bus,
        lastAssignment: null,
        lastResult: { guess, actual: score.actual, correct: true },
        awaitingContinue: true
      },
      log: [
        ...state.log,
        makeLog(`Bus card ${positionIndex + 1}: correct.`, 'bus', {
          title: `Card ${positionIndex + 1} right`,
          detail: formatCard(card),
          cardLabel: formatCard(card),
          result: 'correct'
        })
      ]
    });
  }

  const units = busFailureUnits(positionIndex, score.actual, guess === 'same');
  const assignment: DrinkAssignment = {
    playerId: 'bus-riders',
    playerName: 'Riders',
    direction: 'take',
    units,
    source: 'bus',
    label: `Riders: Take ${units} each`
  };
  const projectedTotal = state.bus.drinksEach + units;
  const taunt = wrongGuessTaunt(score.correct, busTauntTemplates, rng, { units });
  return stamp({
    ...state,
    bus: {
      ...state.bus,
      lastAssignment: assignment,
      lastResult: { guess, actual: score.actual, correct: false, ...(taunt ? { taunt } : {}) },
      awaitingContinue: true
    },
    log: [
      ...state.log,
      makeLog(
        `Bus failed on card ${positionIndex + 1}: riders Take ${units} each. Bus total will be ${projectedTotal} drinks each.`,
        'bus',
        {
          title: `Riders owe ${units} each`,
          detail: `Bus total: ${projectedTotal} each`,
          assignments: [assignment],
          cardLabel: formatCard(card),
          result: 'wrong'
        }
      )
    ]
  });
}

export function continueBus(state: GameState, rng: () => number = Math.random): GameState {
  if (state.phase !== 'bus') return state;
  if (!state.bus || !state.bus.awaitingContinue || !state.bus.lastResult) return state;

  const positionIndex = state.bus.progressIndex;
  const { correct } = state.bus.lastResult;

  if (correct) {
    const lastResult = state.bus.lastResult;
    const escaped = busEscapesOnCorrectContinue(positionIndex, lastResult);
    const escapedViaSame = escaped && lastResult.guess === 'same';
    const nextProgress = (escaped ? 4 : (positionIndex + 1)) as 0 | 1 | 2 | 3 | 4;
    return stamp({
      ...state,
      phase: escaped ? 'gameOver' : 'bus',
      gameOverReason: escaped ? 'escaped' : state.gameOverReason,
      bus: {
        ...state.bus,
        progressIndex: nextProgress,
        escaped,
        escapedViaSame,
        lastAssignment: null,
        lastResult: null,
        awaitingContinue: false
      },
      log: [
        ...state.log,
        ...(escaped
          ? [
              makeLog(
                escapedViaSame
                  ? 'Called Same correctly — riders are off the bus.'
                  : 'The riders escaped the bus.',
                'bus',
                {
                  title: escapedViaSame ? 'Off the bus' : 'Escaped the bus',
                  result: 'neutral'
                }
              )
            ]
          : [])
      ]
    });
  }

  const assignment = state.bus.lastAssignment;
  if (!assignment) return state;
  const units = assignment.units;
  const replacement = replaceBusCards(
    state.bus.visibleCards,
    state.bus.deck,
    positionIndex + 1,
    state.settings.busMode,
    rng
  );
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
      lastAssignment: null,
      lastResult: null,
      awaitingContinue: false
    }
  });
}

export function matchTableCard(players: Player[], tableCard: TableCard, date = new Date()): TableMatchResult {
  const assignments: DrinkAssignment[] = [];
  const tableValue = cardNumericValue(tableCard.card, date);
  const updatedPlayers = players.map((player) => {
    const matchingCards = player.hand.filter((card) => cardNumericValue(card, date) === tableValue);
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
      hand: player.hand.filter((card) => cardNumericValue(card, date) !== tableValue)
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
    { row: 2, count: 2, value: 2 },
    { row: 3, count: 3, value: 3 },
    { row: 4, count: 4, value: 4 },
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
      log: [...state.log, makeLog('No one rides. The bus left empty.', 'bus', { title: 'No one rides', result: 'neutral' })]
    });
  }
  return stamp({
    ...state,
    phase: 'busIntro',
    log: [
      ...state.log,
      makeLog(`${riders.map((rider) => rider.name).join(', ')} will ride the bus.`, 'bus', {
        title: `${riders.length === 1 ? riders[0].name : `${riders.length} riders`} will ride`,
        detail: riders.map((rider) => rider.name).join(', '),
        result: 'neutral'
      })
    ]
  });
}

function emptyTable(): TableState {
  return { cards: [], activeIndex: 0, completed: false };
}

export function chooseTheme(preference: ThemePreference | unknown, rng: () => number = Math.random): ThemeId {
  if (preference === 'random') {
    return themeIds[Math.floor(rng() * themeIds.length)] ?? 'poker';
  }
  return isThemeId(preference) ? preference : 'poker';
}

function chooseCardBack(theme: ThemeId, rng: () => number = Math.random): CardBackId {
  const pool = cardBackIdsByTheme[theme] ?? cardBackIdsByTheme.poker;
  return pool[Math.floor(rng() * pool.length)] ?? 'emerald';
}

function wrongGuessTaunt(
  correct: boolean,
  templates: string[],
  rng: () => number,
  context: { name?: string; units?: number }
): string | undefined {
  if (correct || rng() >= TAUNT_CHANCE) return undefined;
  const template = templates[Math.floor(rng() * templates.length)] ?? templates[0] ?? '';
  return template
    .replace('{name}', context.name ?? 'You')
    .replace('{units}', String(context.units ?? 1));
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

function formatCard(card: Card): string {
  return `${card.rank} ${suitGlyphs[card.suit]}`;
}
