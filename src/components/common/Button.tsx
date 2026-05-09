import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-gold text-ink font-black shadow-glow active:scale-[0.97] active:shadow-none',
  secondary:
    'bg-white/[0.11] text-cream font-semibold ring-1 ring-white/[0.13] active:scale-[0.97] active:bg-white/[0.17]',
  ghost:
    'bg-transparent text-gold font-semibold active:bg-white/[0.09]',
  danger:
    'bg-red-suit text-white font-black shadow-danger active:scale-[0.97] active:shadow-none',
};

export function Button({ className = '', variant = 'primary', children, ...props }: ButtonProps) {
  return (
    <button
      className={`tap-target rounded-2xl px-5 text-center text-sm outline-none transition-[transform,box-shadow] duration-100 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-felt-base disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
