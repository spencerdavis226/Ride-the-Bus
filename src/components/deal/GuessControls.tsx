import type { Suit } from '../../game/cards';
import type { DealSubphase } from '../../game/phases';
import type { BusGuess } from '../../game/rules';

export function GuessControls({ subphase, onGuess }: { subphase: DealSubphase; onGuess: (guess: BusGuess) => void }) {
  if (subphase === 'redBlack') {
    return (
      <div className="grid grid-cols-2 gap-2">
        <GuessButton label="Red" tone="red" onClick={() => onGuess('red')} />
        <GuessButton label="Black" onClick={() => onGuess('black')} />
      </div>
    );
  }
  if (subphase === 'higherLowerSame') {
    return (
      <div className="grid grid-cols-3 gap-2">
        <GuessButton label="Higher" onClick={() => onGuess('higher')} />
        <GuessButton label="Lower" onClick={() => onGuess('lower')} />
        <GuessButton label="Same" tone="gold" onClick={() => onGuess('same')} />
      </div>
    );
  }
  if (subphase === 'insideOutsideSame') {
    return (
      <div className="grid grid-cols-3 gap-2">
        <GuessButton label="Inside" onClick={() => onGuess('inside')} />
        <GuessButton label="Outside" onClick={() => onGuess('outside')} />
        <GuessButton label="Same" tone="gold" onClick={() => onGuess('same')} />
      </div>
    );
  }
  const suits: Array<{ suit: Suit; label: string; red?: boolean }> = [
    { suit: 'spades', label: '♠' },
    { suit: 'hearts', label: '♥', red: true },
    { suit: 'diamonds', label: '♦', red: true },
    { suit: 'clubs', label: '♣' }
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {suits.map((suit) => (
        <GuessButton key={suit.suit} label={suit.label} tone={suit.red ? 'red' : 'dark'} onClick={() => onGuess(suit.suit)} />
      ))}
    </div>
  );
}

function GuessButton({ label, onClick, tone = 'dark' }: { label: string; onClick: () => void; tone?: 'dark' | 'red' | 'gold' }) {
  const classes = {
    dark: 'bg-white/[0.12] text-[#fff7e6] ring-white/12',
    red: 'bg-[#b72e35] text-white ring-[#ff9a9a]/20',
    gold: 'bg-[#f5d99b] text-[#142019] ring-[#f5d99b]'
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tap-target rounded-xl px-2 text-lg font-bold ring-1 transition active:scale-[0.98] ${classes[tone]}`}
    >
      {label}
    </button>
  );
}
