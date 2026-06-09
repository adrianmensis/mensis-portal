import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const base =
  "inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white shadow-[0_4px_16px_-4px_rgba(39,59,124,0.4)] hover:bg-brand/90 hover:shadow-[0_6px_20px_-4px_rgba(39,59,124,0.5)]",
  secondary:
    "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50",
};

export function Button({ variant = "primary", className = "", ...rest }: Props) {
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`.trim()}
      {...rest}
    />
  );
}
