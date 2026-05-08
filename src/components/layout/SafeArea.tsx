import type { ReactNode } from 'react';

export function SafeArea({ children }: { children: ReactNode }) {
  return <div className="safe-screen">{children}</div>;
}
