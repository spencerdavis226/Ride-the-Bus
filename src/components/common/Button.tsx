import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--rtb-accent)] text-[var(--rtb-accent-text)] font-black shadow-glow active:scale-[0.97] active:shadow-none',
  secondary:
    'bg-[var(--rtb-surface-soft)] text-[var(--rtb-text)] font-semibold ring-1 ring-[var(--rtb-border)] active:scale-[0.97] active:bg-[var(--rtb-surface-strong)]',
  ghost:
    'bg-transparent text-[var(--rtb-accent)] font-semibold active:bg-[var(--rtb-surface-soft)]',
  danger:
    'bg-[var(--rtb-danger)] text-[var(--rtb-danger-text)] font-black shadow-[0_2px_18px_var(--rtb-shadow)] active:scale-[0.97] active:shadow-none',
};

export function Button({ className = '', variant = 'primary', children, ...props }: ButtonProps) {
  return (
    <button
      className={`tap-target rounded-2xl px-5 text-center text-sm outline-none transition-[transform,box-shadow] duration-100 focus-visible:ring-2 focus-visible:ring-[var(--rtb-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rtb-app-bg)] disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
