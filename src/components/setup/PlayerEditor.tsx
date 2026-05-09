import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function PlayerEditor({ names, onChange }: { names: string[]; onChange: (names: string[]) => void }) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const pendingFocusIndex = useRef<number | null>(null);

  useEffect(() => {
    const index = pendingFocusIndex.current;
    if (index === null) return;
    pendingFocusIndex.current = null;
    inputRefs.current[index]?.focus();
  }, [names.length]);

  const updateName = (index: number, value: string) => {
    onChange(names.map((name, i) => (i === index ? value : name)));
  };
  const addPlayer = (focusNewPlayer = false) => {
    if (focusNewPlayer) {
      pendingFocusIndex.current = names.length;
    }
    onChange([...names, '']);
  };
  const removePlayer = (index: number) => {
    if (names.length <= 2) return;
    onChange(names.filter((_, i) => i !== index));
  };
  const focusNextPlayer = (index: number) => {
    if (index < names.length - 1) {
      inputRefs.current[index + 1]?.focus();
      return;
    }
    addPlayer(true);
  };

  return (
    <div className="player-editor space-y-2.5 desktop-xl:grid desktop-xl:grid-cols-2 desktop-xl:gap-[0.85rem]">
      {names.map((name, index) => (
        <label
          key={index}
          className="player-row flex min-w-0 items-center gap-3 rounded-xl bg-felt-card/72 px-3 py-1 ring-1 ring-white/[0.07] transition-[box-shadow,background-color] duration-150 focus-within:bg-felt-raised focus-within:ring-gold/50 desktop-xl:rounded-[1.15rem]"
        >
          <span className="player-index grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-black/18 text-sm font-black text-gold/62 desktop-xl:h-[2.4rem] desktop-xl:w-[2.4rem] desktop-xl:text-base">
            {index + 1}
          </span>
          <input
            ref={(node) => {
              inputRefs.current[index] = node;
            }}
            value={name}
            onChange={(e) => updateName(index, e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              focusNextPlayer(index);
            }}
            className="player-input min-h-[48px] min-w-0 flex-1 bg-transparent text-[1rem] font-black text-cream outline-none placeholder:text-white/28 desktop-xl:min-h-[4rem] desktop-xl:text-[1.12rem]"
            placeholder={`Player ${index + 1}`}
          />
          <button
            aria-label={`Remove ${name || `Player ${index + 1}`}`}
            className="player-remove grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white/45 transition-[transform,color] duration-100 active:scale-90 active:text-white/80 disabled:opacity-25 desktop-xl:h-12 desktop-xl:w-12"
            disabled={names.length <= 2}
            onClick={() => removePlayer(index)}
            type="button"
          >
            <Trash2 size={16} />
          </button>
        </label>
      ))}
      <button
        type="button"
        onClick={() => addPlayer(true)}
        className="add-player-button tap-target flex w-full items-center justify-center gap-2 rounded-xl bg-felt-card/72 text-sm font-black text-gold/82 ring-1 ring-white/[0.07] transition-[transform,background-color] duration-100 active:scale-[0.98] active:bg-white/[0.12] desktop-xl:rounded-[1.15rem] desktop-xl:min-h-[4.4rem] desktop-xl:text-[1.05rem]"
      >
        <Plus size={16} />
        Add Player
      </button>
    </div>
  );
}
