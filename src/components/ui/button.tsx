import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const base =
  "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand/90",
  secondary:
    "border border-brand-light bg-white text-brand hover:bg-brand-light/30",
};

export function Button({ variant = "primary", className = "", ...rest }: Props) {
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`.trim()}
      {...rest}
    />
  );
}
