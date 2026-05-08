import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[#f5d99b] text-[#142019] font-black shadow-glow active:scale-[0.97] active:shadow-none',
  secondary:
    'bg-white/[0.11] text-[#fff7e6] font-semibold ring-1 ring-white/[0.13] active:scale-[0.97] active:bg-white/[0.17]',
  ghost:
    'bg-transparent text-[#f5d99b] font-semibold active:bg-white/[0.09]',
  danger:
    'bg-[#b72e35] text-white font-black shadow-[0_2px_18px_rgba(183,46,53,0.32)] active:scale-[0.97] active:shadow-none',
};

export function Button({ className = '', variant = 'primary', children, ...props }: ButtonProps) {
  return (
    <button
      className={`tap-target rounded-2xl px-5 text-center text-sm outline-none transition-[transform,box-shadow] duration-100 focus-visible:ring-2 focus-visible:ring-[#f5d99b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071812] disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
