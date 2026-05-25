import type { ReactNode } from 'react';

export function BottomActionBar({ children }: { children: ReactNode }) {
  return (
    <div
      className="bottom-action-bar sticky bottom-0 z-10 mt-auto -mx-3 bg-gradient-to-t from-black/55 via-black/25 to-transparent px-3 pt-6"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="grid gap-2">{children}</div>
    </div>
  );
}
