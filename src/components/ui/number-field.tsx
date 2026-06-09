"use client";

import { useState } from "react";
import { Label } from "./label";

// Numeric input that keeps its own sanitized text (strips leading zeros and
// non-numeric chars) and reports the parsed number via onValue. Avoids the
// "010" leading-zero glitch of a number-typed input bound to number state.
export function NumberField({
  label,
  name,
  defaultValue = 0,
  prefix,
  suffix,
  onValue,
  wrapperClassName = "",
}: {
  label?: string;
  name?: string;
  defaultValue?: number;
  prefix?: string;
  suffix?: string;
  onValue: (n: number) => void;
  wrapperClassName?: string;
}) {
  const [text, setText] = useState(defaultValue ? String(defaultValue) : "");

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    let v = e.target.value.replace(/[^\d.]/g, "");
    v = v.replace(/^0+(?=\d)/, ""); // strip leading zeros
    setText(v);
    onValue(v === "" ? 0 : Number(v));
  }

  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`.trim()}>
      {label && <Label htmlFor={name}>{label}</Label>}
      <div className="flex h-11 items-center rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 transition-colors focus-within:border-brand/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/10">
        {prefix && <span className="mr-1 text-sm text-zinc-400">{prefix}</span>}
        <input
          id={name}
          name={name}
          inputMode="decimal"
          value={text}
          onChange={handle}
          placeholder="0"
          className="h-full w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
        />
        {suffix && <span className="ml-1 whitespace-nowrap text-sm text-zinc-400">{suffix}</span>}
      </div>
    </div>
  );
}
