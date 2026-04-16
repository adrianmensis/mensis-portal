import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...rest }: Props) {
  return (
    <div
      className={`rounded-xl border border-brand-light/60 bg-white p-6 shadow-sm ${className}`.trim()}
      {...rest}
    />
  );
}
