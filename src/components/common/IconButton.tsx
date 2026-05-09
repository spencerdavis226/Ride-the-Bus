import type { ButtonHTMLAttributes, ReactNode } from 'react';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
  ghost?: boolean;
};

export function IconButton({ label, children, className = '', ghost = false, ...props }: IconButtonProps) {
  const base = ghost
    ? 'text-[#fff7e6]/50 active:text-[#fff7e6]/90'
    : 'bg-white/[0.10] text-[#fff7e6]/80 ring-1 ring-white/[0.10] active:bg-white/[0.18]';
  return (
    <button
      aria-label={label}
      title={label}
      className={`grid h-10 w-10 md:h-12 md:w-12 place-items-center rounded-[0.65rem] transition-[transform,color,background-color] duration-100 active:scale-90 ${base} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
