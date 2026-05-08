import type { ReactNode } from 'react';

export function BottomActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 mt-auto -mx-1 bg-gradient-to-t from-black/40 via-black/20 to-transparent px-1 pb-1 pt-4">
      <div className="grid gap-2">{children}</div>
    </div>
  );
}
