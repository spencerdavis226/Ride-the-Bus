import type { ReactNode } from 'react';

export function BottomActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 mt-auto -mx-3 bg-gradient-to-t from-black/55 via-black/25 to-transparent px-3 pb-3 pt-6">
      <div className="grid gap-2">{children}</div>
    </div>
  );
}
