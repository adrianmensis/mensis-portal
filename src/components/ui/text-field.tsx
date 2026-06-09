import type { InputHTMLAttributes } from "react";
import { Label } from "./label";
import { Input } from "./input";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  wrapperClassName?: string;
};

// Label + Input in one small piece. `wrapperClassName` styles the wrapper
// (e.g. "sm:col-span-2"); input attributes pass straight through.
export function TextField({ label, name, wrapperClassName = "", ...inputProps }: Props) {
  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`.trim()}>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...inputProps} />
    </div>
  );
}
