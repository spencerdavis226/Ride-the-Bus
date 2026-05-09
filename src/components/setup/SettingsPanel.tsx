import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { themes } from '../../styles/themes';
import type { BusMode, ThemePreference } from '../../game/state';

export function SettingsPanel({
  busMode,
  themePreference,
  onBusMode,
  onTheme,
}: {
  busMode: BusMode;
  themePreference: ThemePreference;
  onBusMode: (mode: BusMode) => void;
  onTheme: (theme: ThemePreference) => void;
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

      <ThemeDropdown value={themePreference} onChange={onTheme} />

      <div className="rounded-xl bg-white/[0.06] p-3.5 leading-relaxed text-[#fff7e6]/55">
        Add to Home Screen from Safari's share menu. The app works fully offline after the first load.
      </div>
    </div>
  );
}

function ThemeDropdown({
  onChange,
  value,
}: {
  onChange: (theme: ThemePreference) => void;
  value: ThemePreference;
}) {
  const [open, setOpen] = useState(false);
  const selected = value === 'random'
    ? { name: 'Random each game', description: 'Surprise me', colors: ['#0d4a36', '#872d32', '#d7b56d'] as [string, string, string] }
    : themes.find((theme) => theme.id === value) ?? themes[0];
  const options = [
    { id: 'random' as const, name: 'Random each game', description: 'Pick a table each game', colors: ['#0d4a36', '#872d32', '#d7b56d'] as [string, string, string] },
    ...themes,
  ];

  return (
    <fieldset>
      <legend className="mb-2.5 text-[0.62rem] font-black uppercase tracking-[0.22em] text-[#f5d99b]/75">
        Theme
      </legend>
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-2xl bg-white/[0.08] p-3 text-left ring-1 ring-white/[0.10] transition-colors active:bg-white/[0.13]"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <ThemeSwatch colors={selected.colors} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-black text-[#fff7e6]">{selected.name}</span>
          <span className="block truncate text-xs font-semibold text-[#fff7e6]/48">{selected.description}</span>
        </span>
        <ChevronDown
          size={22}
          className={`shrink-0 text-[#f5d99b]/65 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="mt-2 grid max-h-[min(45dvh,24rem)] gap-2 overflow-y-auto rounded-2xl bg-black/20 p-2 ring-1 ring-white/[0.08] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {options.map((option) => {
            const active = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                className={`flex min-h-[4.2rem] items-center gap-3 rounded-xl p-3 text-left ring-1 transition-colors ${
                  active
                    ? 'bg-[#f5d99b] text-[#142019] ring-[#f5d99b] shadow-glow-sm'
                    : 'bg-white/[0.06] text-[#fff7e6] ring-white/[0.07] active:bg-white/[0.12]'
                }`}
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
              >
                <ThemeSwatch colors={option.colors} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-black">{option.name}</span>
                  <span className={`block truncate text-xs font-semibold ${active ? 'text-[#142019]/62' : 'text-[#fff7e6]/45'}`}>
                    {option.description}
                  </span>
                </span>
                {active && <Check size={20} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}

function ThemeSwatch({ colors }: { colors: [string, string, string] }) {
  return (
    <span className="flex h-11 w-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-black/20">
      {colors.map((color) => (
        <span key={color} className="h-full flex-1" style={{ backgroundColor: color }} />
      ))}
    </span>
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
