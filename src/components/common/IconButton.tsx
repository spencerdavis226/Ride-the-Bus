import type { ButtonHTMLAttributes, ReactNode } from 'react';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
};

export function IconButton({ label, children, className = '', ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`grid h-10 w-10 place-items-center rounded-[0.65rem] bg-white/[0.10] text-[#fff7e6]/80 ring-1 ring-white/[0.10] transition-[transform,background-color] duration-100 active:scale-90 active:bg-white/[0.18] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
