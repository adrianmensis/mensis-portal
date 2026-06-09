import type { SelectHTMLAttributes } from "react";
import { Label } from "./label";

const base =
  "h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 text-sm text-zinc-900 outline-none transition-colors focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10";

export function Select({ className = "", ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${base} ${className}`.trim()} {...rest} />;
}

export function SelectField({
  label,
  name,
  options,
  wrapperClassName = "",
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  options: readonly string[];
  wrapperClassName?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`.trim()}>
      <Label htmlFor={name}>{label}</Label>
      <Select id={name} name={name} defaultValue={defaultValue} required={required}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </Select>
    </div>
  );
}
