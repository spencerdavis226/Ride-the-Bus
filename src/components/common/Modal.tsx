import type { ReactNode } from 'react';

export function Modal({ children }: { children: ReactNode }) {
  return <div className="glass-panel rounded-xl p-4">{children}</div>;
}
