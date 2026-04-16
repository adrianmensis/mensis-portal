import type { LabelHTMLAttributes } from "react";

type Props = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className = "", ...rest }: Props) {
  return (
    <label
      className={`text-sm font-medium text-brand ${className}`.trim()}
      {...rest}
    />
  );
}
