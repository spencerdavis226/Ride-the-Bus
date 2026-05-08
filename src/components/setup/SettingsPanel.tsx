import { themes } from '../../styles/themes';
import type { AnimationSpeed, BusMode, ThemePreference } from '../../game/state';

export function SettingsPanel({
  busMode,
  animationSpeed,
  themePreference,
  onBusMode,
  onAnimationSpeed,
  onTheme,
}: {
  busMode: BusMode;
  animationSpeed: AnimationSpeed;
  themePreference: ThemePreference;
  onBusMode: (mode: BusMode) => void;
  onAnimationSpeed: (speed: AnimationSpeed) => void;
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

      <fieldset>
        <legend className="mb-2.5 text-[0.62rem] font-black uppercase tracking-[0.22em] text-[#f5d99b]/75">
          Animation Speed
        </legend>
        <SegmentControl
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'fast', label: 'Fast' },
          ]}
          value={animationSpeed}
          onChange={(v) => onAnimationSpeed(v as AnimationSpeed)}
        />
      </fieldset>

      <label className="block">
        <span className="mb-2.5 block text-[0.62rem] font-black uppercase tracking-[0.22em] text-[#f5d99b]/75">
          Theme
        </span>
        <select
          className="tap-target w-full rounded-xl bg-white/[0.09] px-4 text-sm font-semibold text-[#fff7e6] ring-1 ring-white/[0.09]"
          value={themePreference}
          onChange={(e) => onTheme(e.target.value as ThemePreference)}
        >
          <option value="random">Random each game</option>
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
      </label>

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
