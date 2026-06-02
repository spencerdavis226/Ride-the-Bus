import { BadgePlus, Check, Plus, Share } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Drawer } from '../common/Drawer';
import { canSuggestIOSHomeScreenInstall } from './homeScreenInstallEligibility';

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

export function HomeScreenInstallPrompt() {
  const canSuggestInstall = useCanSuggestInstall();
  const [open, setOpen] = useState(false);

  if (!canSuggestInstall) return null;

  return (
    <>
      <button
        type="button"
        className="tap-target group flex w-full items-center gap-3 rounded-2xl bg-[var(--rtb-surface-soft)] px-3.5 py-2.5 text-left text-[var(--rtb-text)] ring-1 ring-[var(--rtb-border)] transition-[transform,background-color] duration-100 active:scale-[0.98] active:bg-[var(--rtb-surface-strong)]"
        aria-label="Show instructions to add Ride the Bus to your Home Screen"
        onClick={() => setOpen(true)}
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--rtb-accent-soft)] text-[var(--rtb-accent)] ring-1 ring-[var(--rtb-border-strong)]">
          <BadgePlus size={22} strokeWidth={2.4} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black leading-tight">Add to Home Screen</span>
          <span className="mt-0.5 block text-xs font-semibold leading-snug text-[var(--rtb-text-muted)]">
            Play full screen from your Home Screen.
          </span>
        </span>
      </button>

      <Drawer
        open={open}
        title="Add to Home Screen"
        contentClassName="space-y-4 pt-0.5"
        contentMaxHeight="min(72dvh, 34rem)"
        onClose={() => setOpen(false)}
      >
        <div className="rounded-2xl bg-[var(--rtb-accent-panel)] p-3 ring-1 ring-[var(--rtb-border-strong)]">
          <div className="flex items-center gap-3">
            <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-[1rem] bg-[var(--rtb-surface)] shadow-glow-sm ring-1 ring-[var(--rtb-border-strong)]">
              <img src={`${import.meta.env.BASE_URL}icon.png`} alt="" className="h-full w-full object-cover" />
            </span>
            <div className="min-w-0">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-[var(--rtb-accent)]">
                Better on the table
              </p>
              <p className="mt-1 text-lg font-black leading-tight text-[var(--rtb-text)]">
                Save Ride the Bus as an app.
              </p>
            </div>
          </div>
        </div>

        <ol className="grid gap-2.5" aria-label="Home Screen installation steps">
          <InstallStep
            number={1}
            icon={<Share size={20} strokeWidth={2.5} />}
            title="Tap Share"
            body="Use Safari's share button in the bottom toolbar."
          />
          <InstallStep
            number={2}
            icon={<Plus size={21} strokeWidth={2.7} />}
            title="Choose Add to Home Screen"
            body="Scroll the share sheet until you see the Home Screen option."
          />
          <InstallStep
            number={3}
            icon={<Check size={21} strokeWidth={2.8} />}
            title="Tap Add"
            body="Ride the Bus will open full screen from your Home Screen."
          />
        </ol>
      </Drawer>
    </>
  );
}

function useCanSuggestInstall(): boolean {
  const [canSuggestInstall, setCanSuggestInstall] = useState(false);

  useEffect(() => {
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('showInstallPrompt')) {
      setCanSuggestInstall(true);
      return;
    }

    const navigatorWithStandalone = window.navigator as NavigatorWithStandalone;
    setCanSuggestInstall(
      canSuggestIOSHomeScreenInstall({
        displayModeStandalone: window.matchMedia('(display-mode: standalone)').matches,
        maxTouchPoints: navigatorWithStandalone.maxTouchPoints,
        platform: navigatorWithStandalone.platform,
        standalone: Boolean(navigatorWithStandalone.standalone),
        userAgent: navigatorWithStandalone.userAgent,
        vendor: navigatorWithStandalone.vendor,
      })
    );
  }, []);

  return canSuggestInstall;
}

function InstallStep({
  body,
  icon,
  number,
  title,
}: {
  body: string;
  icon: React.ReactNode;
  number: number;
  title: string;
}) {
  return (
    <li className="flex min-h-[5rem] items-center gap-3 rounded-2xl bg-[var(--rtb-surface-soft)] p-3 ring-1 ring-[var(--rtb-border)]">
      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--rtb-accent-soft)] text-[var(--rtb-accent)] ring-1 ring-[var(--rtb-border)]">
        {icon}
        <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[var(--rtb-accent)] text-[0.62rem] font-black text-[var(--rtb-accent-text)]">
          {number}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black leading-tight text-[var(--rtb-text)]">{title}</span>
        <span className="mt-1 block text-sm font-semibold leading-snug text-[var(--rtb-text-muted)]">{body}</span>
      </span>
    </li>
  );
}
