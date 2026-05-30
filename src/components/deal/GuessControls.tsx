import type { Suit } from '../../game/cards';
import type { DealSubphase } from '../../game/phases';
import type { BusGuess } from '../../game/rules';

export function GuessControls({ subphase, onGuess }: { subphase: DealSubphase; onGuess: (guess: BusGuess) => void }) {
  if (subphase === 'redBlack') {
    return (
      <div className="grid grid-cols-2 gap-2">
        <GuessButton label="Red" tone="red" onClick={() => onGuess('red')} />
        <GuessButton label="Black" tone="dark" onClick={() => onGuess('black')} />
      </div>
    );
  }
  if (subphase === 'higherLowerSame') {
    return (
      <div className="grid grid-cols-3 gap-2">
        <GuessButton label="Higher" tone="dark" onClick={() => onGuess('higher')} />
        <GuessButton label="Lower" tone="dark" onClick={() => onGuess('lower')} />
        <GuessButton label="Same" tone="gold" onClick={() => onGuess('same')} />
      </div>
    );
  }
  if (subphase === 'insideOutsideSame') {
    return (
      <div className="grid grid-cols-3 gap-2">
        <GuessButton label="Inside" tone="dark" onClick={() => onGuess('inside')} />
        <GuessButton label="Outside" tone="dark" onClick={() => onGuess('outside')} />
        <GuessButton label="Same" tone="gold" onClick={() => onGuess('same')} />
      </div>
    );
  }
  const suits: Array<{ suit: Suit; label: string; red?: boolean }> = [
    { suit: 'spades', label: '♠' },
    { suit: 'hearts', label: '♥', red: true },
    { suit: 'diamonds', label: '♦', red: true },
    { suit: 'clubs', label: '♣' },
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {suits.map((suit) => (
        <GuessButton
          key={suit.suit}
          label={suit.label}
          tone={suit.red ? 'red' : 'dark'}
          onClick={() => onGuess(suit.suit)}
        />
      ))}
    </div>
  );
}

const toneClasses = {
  dark: 'bg-[var(--rtb-guess-dark-bg)] text-[var(--rtb-guess-dark-text)] ring-1 ring-[var(--rtb-border-strong)] shadow-[inset_0_1px_0_var(--rtb-border)]',
  red: 'bg-[var(--rtb-danger)] text-[var(--rtb-danger-text)] ring-1 ring-[var(--rtb-border)] shadow-[inset_0_1px_0_var(--rtb-border)]',
  gold: 'bg-[var(--rtb-accent)] text-[var(--rtb-accent-text)] ring-1 ring-[var(--rtb-border-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]',
};

function GuessButton({
  label,
  onClick,
  tone = 'dark',
}: {
  label: string;
  onClick: () => void;
  tone?: 'dark' | 'red' | 'gold';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tap-target rounded-2xl px-2 text-lg font-black transition-transform duration-100 active:scale-[0.96] ${toneClasses[tone]}`}
    >
      {label}
    </button>
  );
}
