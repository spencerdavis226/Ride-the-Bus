import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-[#f5d99b] text-[#142019] shadow-glow active:scale-[0.98]',
  secondary: 'bg-white/12 text-[#fff7e6] ring-1 ring-white/12 active:scale-[0.98]',
  ghost: 'bg-transparent text-[#f5d99b] active:bg-white/10',
  danger: 'bg-[#b72e35] text-white shadow-card active:scale-[0.98]'
};

export function Button({ className = '', variant = 'primary', children, ...props }: ButtonProps) {
  return (
    <button
      className={`tap-target rounded-lg px-4 py-3 text-center text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[#f5d99b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071812] disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
