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
      className={`grid h-11 w-11 place-items-center rounded-full bg-white/10 text-[#fff7e6] ring-1 ring-white/10 transition active:scale-95 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
