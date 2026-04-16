import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...rest }: Props) {
  return (
    <input
      className={`h-10 w-full rounded-md border border-brand-light bg-white px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-brand focus:ring-2 focus:ring-brand/20 ${className}`.trim()}
      {...rest}
    />
  );
}
