import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...rest }: Props) {
  return (
    <input
      className={`h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10 ${className}`.trim()}
      {...rest}
    />
  );
}
