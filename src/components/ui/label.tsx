import type { LabelHTMLAttributes } from "react";

type Props = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className = "", ...rest }: Props) {
  return (
    <label
      className={`text-[13px] font-medium text-zinc-600 ${className}`.trim()}
      {...rest}
    />
  );
}
