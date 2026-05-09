import { Plus, Trash2 } from 'lucide-react';

export function PlayerEditor({ names, onChange }: { names: string[]; onChange: (names: string[]) => void }) {
  const updateName = (index: number, value: string) => {
    onChange(names.map((name, i) => (i === index ? value : name)));
  };
  const addPlayer = () => onChange([...names, `Player ${names.length + 1}`]);
  const removePlayer = (index: number) => {
    if (names.length <= 2) return;
    onChange(names.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2.5">
      {names.map((name, index) => (
        <label
          key={index}
          className="flex min-w-0 items-center gap-3 rounded-xl bg-[#183428]/72 px-3 py-1 ring-1 ring-white/[0.07] transition-[box-shadow,background-color] duration-150 focus-within:bg-[#1c3c2e] focus-within:ring-[#f5d99b]/50"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-black/18 text-sm font-black text-[#f5d99b]/62">
            {index + 1}
          </span>
          <input
            value={name}
            onChange={(e) => updateName(index, e.target.value)}
            className="min-h-[48px] min-w-0 flex-1 bg-transparent text-[1rem] font-black text-[#fff7e6] outline-none placeholder:text-white/28"
            placeholder={`Player ${index + 1}`}
          />
          <button
            aria-label={`Remove ${name || `Player ${index + 1}`}`}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white/45 transition-[transform,color] duration-100 active:scale-90 active:text-white/80 disabled:opacity-25"
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
        onClick={addPlayer}
        className="tap-target flex w-full items-center justify-center gap-2 rounded-xl bg-[#183428]/72 text-sm font-black text-[#f5d99b]/82 ring-1 ring-white/[0.07] transition-[transform,background-color] duration-100 active:scale-[0.98] active:bg-white/[0.12]"
      >
        <Plus size={16} />
        Add Player
      </button>
    </div>
  );
}
