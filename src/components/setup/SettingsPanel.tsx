import { themes } from '../../styles/themes';
import type { AnimationSpeed, BusMode, ThemePreference } from '../../game/state';

export function SettingsPanel({
  busMode,
  animationSpeed,
  themePreference,
  onBusMode,
  onAnimationSpeed,
  onTheme
}: {
  busMode: BusMode;
  animationSpeed: AnimationSpeed;
  themePreference: ThemePreference;
  onBusMode: (mode: BusMode) => void;
  onAnimationSpeed: (speed: AnimationSpeed) => void;
  onTheme: (theme: ThemePreference) => void;
}) {
  return (
    <div className="space-y-5 text-sm">
      <fieldset>
        <legend className="mb-2 font-semibold text-[#f5d99b]">The Bus</legend>
        <div className="grid grid-cols-2 gap-2">
          <Segment active={busMode === 'singleDeck'} onClick={() => onBusMode('singleDeck')} label="Single deck" />
          <Segment active={busMode === 'endless'} onClick={() => onBusMode('endless')} label="Endless" />
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 font-semibold text-[#f5d99b]">Animation</legend>
        <div className="grid grid-cols-2 gap-2">
          <Segment active={animationSpeed === 'normal'} onClick={() => onAnimationSpeed('normal')} label="Normal" />
          <Segment active={animationSpeed === 'fast'} onClick={() => onAnimationSpeed('fast')} label="Fast" />
        </div>
      </fieldset>
      <label className="block">
        <span className="mb-2 block font-semibold text-[#f5d99b]">Theme</span>
        <select
          className="tap-target w-full rounded-lg bg-white/[0.1] px-3 text-[#fff7e6] ring-1 ring-white/10"
          value={themePreference}
          onChange={(event) => onTheme(event.target.value as ThemePreference)}
        >
          <option value="random">Random each game</option>
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
      </label>
      <div className="rounded-lg bg-white/[0.07] p-3 text-[#fff7e6]/70">
        Add to Home Screen from Safari share options. The app works offline after the first load.
      </div>
    </div>
  );
}

function Segment({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tap-target rounded-lg px-3 text-sm font-semibold ring-1 transition ${
        active ? 'bg-[#f5d99b] text-[#142019] ring-[#f5d99b]' : 'bg-white/[0.08] text-[#fff7e6]/76 ring-white/10'
      }`}
    >
      {label}
    </button>
  );
}
