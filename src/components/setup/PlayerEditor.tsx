import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';

export function PlayerEditor({ names, onChange }: { names: string[]; onChange: (names: string[]) => void }) {
  const updateName = (index: number, value: string) => {
    onChange(names.map((name, candidateIndex) => (candidateIndex === index ? value : name)));
  };
  const addPlayer = () => onChange([...names, `Player ${names.length + 1}`]);
  const removePlayer = (index: number) => {
    if (names.length <= 2) return;
    onChange(names.filter((_, candidateIndex) => candidateIndex !== index));
  };

  return (
    <div className="min-w-0 space-y-3 pb-1">
      {names.map((name, index) => (
        <label key={index} className="flex min-w-0 items-center gap-2 rounded-lg bg-white/[0.08] p-2 ring-1 ring-white/10">
          <span className="w-8 shrink-0 text-center text-sm text-[#f5d99b]/75">{index + 1}</span>
          <input
            value={name}
            onChange={(event) => updateName(index, event.target.value)}
            className="min-h-11 min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-white/35"
            placeholder={`Player ${index + 1}`}
          />
          <button
            aria-label={`Remove ${name || `Player ${index + 1}`}`}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md text-white/60 disabled:opacity-25"
            disabled={names.length <= 2}
            onClick={() => removePlayer(index)}
            type="button"
          >
            <Trash2 size={18} />
          </button>
        </label>
      ))}
      <Button variant="secondary" onClick={addPlayer} className="w-full">
        <span className="inline-flex items-center justify-center gap-2">
          <Plus size={18} /> Add Player
        </span>
      </Button>
    </div>
  );
}
