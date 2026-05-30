import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { formatPlayerNameInput, PLAYER_NAME_MAX_LENGTH } from '../../game/playerNames';

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
    onChange(names.map((name, i) => (i === index ? formatPlayerNameInput(value) : name)));
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
    <div className="player-editor space-y-2.5">
      {names.map((name, index) => {
        const inputId = `player-name-${index}`;
        return (
        <label
          key={index}
          htmlFor={inputId}
          className="player-row flex min-w-0 items-center gap-3 rounded-xl bg-[var(--rtb-surface-raised)] px-3 py-1 ring-1 ring-[var(--rtb-border)] transition-[box-shadow,background-color] duration-150 focus-within:bg-[var(--rtb-surface-strong)] focus-within:ring-[var(--rtb-focus)]"
        >
          <span className="player-index grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--rtb-accent-soft)] text-sm font-black text-[var(--rtb-accent)]">
            {index + 1}
          </span>
          <input
            id={inputId}
            ref={(node) => {
              inputRefs.current[index] = node;
            }}
            value={name}
            autoCapitalize="words"
            autoComplete="given-name"
            maxLength={PLAYER_NAME_MAX_LENGTH}
            onChange={(e) => updateName(index, e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              focusNextPlayer(index);
            }}
            className="player-input min-h-[48px] min-w-0 flex-1 bg-transparent text-[1rem] font-black text-[var(--rtb-text)] outline-none placeholder:text-[var(--rtb-text-faint)]"
            placeholder={`Player ${index + 1}`}
          />
          <button
            aria-label={`Remove ${name || `Player ${index + 1}`}`}
            className="player-remove grid h-11 w-11 shrink-0 place-items-center rounded-lg text-[var(--rtb-text-faint)] transition-[transform,color] duration-100 active:scale-90 active:text-[var(--rtb-text)] disabled:opacity-25"
            disabled={names.length <= 2}
            onClick={() => removePlayer(index)}
            type="button"
          >
            <Trash2 size={16} />
          </button>
        </label>
        );
      })}
      <button
        type="button"
        onClick={() => addPlayer(true)}
        className="add-player-button tap-target flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--rtb-surface-raised)] text-sm font-black text-[var(--rtb-accent)] ring-1 ring-[var(--rtb-border)] transition-[transform,background-color] duration-100 active:scale-[0.98] active:bg-[var(--rtb-surface-strong)]"
      >
        <Plus size={16} />
        Add Player
      </button>
    </div>
  );
}
