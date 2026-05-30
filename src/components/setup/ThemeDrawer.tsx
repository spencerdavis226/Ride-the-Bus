import { Leaf, Moon, Snowflake, Sparkles, Spade, Sprout, Sun, Waves, type LucideIcon } from 'lucide-react';
import { useGame } from '../../app/GameProvider';
import type { ThemeId } from '../../game/state';
import { themes, type ThemeIconName } from '../../styles/themes';
import { Drawer } from '../common/Drawer';

const themeIcons: Record<ThemeIconName, LucideIcon> = {
  Spade,
  Orbit: Sparkles,
  Moon,
  Sun,
  Waves,
  Leaf,
  Snowflake,
  Sprout,
};

export function ThemeDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useGame();

  function selectTheme(theme: ThemeId) {
    dispatch({ type: 'SET_THEME', theme });
  }

  return (
    <Drawer
      open={open}
      title="Themes"
      contentClassName="space-y-2.5"
      contentMaxHeight="min(78dvh, 44rem)"
      onClose={onClose}
    >
      {themes.map((theme) => {
        const Icon = themeIcons[theme.icon];
        const selected = state.theme === theme.id;

        return (
          <button
            key={theme.id}
            type="button"
            aria-pressed={selected}
            onClick={() => selectTheme(theme.id)}
            className={`theme-option-row tap-target flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-[transform,background-color,box-shadow] duration-100 active:scale-[0.99] ${
              selected ? 'is-selected' : ''
            }`}
          >
            <span className="theme-option-icon grid h-11 w-11 shrink-0 place-items-center rounded-xl">
              <Icon size={22} strokeWidth={2.35} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-black leading-tight text-[var(--rtb-text)]">{theme.name}</span>
              <span className="mt-1 block text-xs font-bold leading-snug text-[var(--rtb-text-muted)]">
                {theme.description}
              </span>
            </span>
            <span className="theme-swatch-row ml-auto flex shrink-0 items-center gap-1" aria-hidden="true">
              {theme.colors.map((color) => (
                <span
                  key={color}
                  className="h-5 w-5 rounded-full ring-1 ring-[var(--rtb-border)]"
                  style={{ backgroundColor: color }}
                />
              ))}
            </span>
          </button>
        );
      })}
    </Drawer>
  );
}
