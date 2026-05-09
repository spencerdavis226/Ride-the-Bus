import type { BusMode } from '../../game/state';

export function SettingsPanel({
  busMode,
  onBusMode,
}: {
  busMode: BusMode;
  onBusMode: (mode: BusMode) => void;
}) {
  return (
    <div className="space-y-6 pb-2 text-sm">
      <fieldset>
        <legend className="mb-2.5 text-[0.62rem] font-black uppercase tracking-[0.22em] text-[#f5d99b]/75">
          The Bus
        </legend>
        <SegmentControl
          options={[
            { value: 'singleDeck', label: 'Single Deck' },
            { value: 'endless', label: 'Endless' },
          ]}
          value={busMode}
          onChange={(v) => onBusMode(v as BusMode)}
        />
      </fieldset>

      <div className="rounded-xl bg-white/[0.06] p-3.5 leading-relaxed text-[#fff7e6]/55">
        Add to Home Screen from Safari's share menu. The app works fully offline after the first load.
      </div>
    </div>
  );
}

function SegmentControl({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`tap-target rounded-xl text-sm font-bold ring-1 transition-[transform,background-color,box-shadow] duration-100 active:scale-[0.97] ${
            option.value === value
              ? 'bg-[#f5d99b] text-[#142019] ring-[#f5d99b] shadow-glow-sm'
              : 'bg-white/[0.07] text-[#fff7e6]/70 ring-white/[0.08] active:bg-white/[0.14]'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
