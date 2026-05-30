import type { ButtonHTMLAttributes, ReactNode } from 'react';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
  ghost?: boolean;
};

export function IconButton({ label, children, className = '', ghost = false, ...props }: IconButtonProps) {
  const base = ghost
    ? 'text-[var(--rtb-text-muted)] active:text-[var(--rtb-accent)]'
    : 'bg-[var(--rtb-surface-soft)] text-[var(--rtb-text)] ring-1 ring-[var(--rtb-border)] active:bg-[var(--rtb-surface-strong)]';
  return (
    <button
      aria-label={label}
      title={label}
      className={`grid h-11 w-11 md:h-12 md:w-12 place-items-center rounded-[0.75rem] transition-[transform,color,background-color] duration-100 active:scale-90 ${base} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
