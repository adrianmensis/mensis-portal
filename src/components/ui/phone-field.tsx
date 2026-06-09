"use client";

import { useMemo, useState } from "react";
import { COUNTRIES, flagEmoji } from "@/lib/countries";
import { Label } from "./label";

// Phone input with a country dial-code selector (flag + code). Submits a
// single combined value (e.g. "+57 3001234567") via a hidden input.
export function PhoneField({
  name,
  label,
  defaultDial = "+57",
  wrapperClassName = "",
}: {
  name: string;
  label: string;
  defaultDial?: string;
  wrapperClassName?: string;
}) {
  const [dial, setDial] = useState(defaultDial);
  const [number, setNumber] = useState("");

  // Unique dial codes with a representative flag, sorted numerically.
  const dialOptions = useMemo(() => {
    const seen = new Set<string>();
    const opts: { dial: string; code: string }[] = [];
    for (const c of COUNTRIES) {
      if (seen.has(c.dial)) continue;
      seen.add(c.dial);
      opts.push({ dial: c.dial, code: c.code });
    }
    return opts.sort((a, b) => Number(a.dial.replace("+", "")) - Number(b.dial.replace("+", "")));
  }, []);

  const combined = number.trim() ? `${dial} ${number.trim()}` : "";

  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`.trim()}>
      <Label htmlFor={`${name}-number`}>{label}</Label>
      <div className="flex gap-2">
        <select
          aria-label="Country code"
          value={dial}
          onChange={(e) => setDial(e.target.value)}
          className="h-11 w-24 shrink-0 rounded-xl border border-zinc-200 bg-zinc-50/50 px-2 text-sm text-zinc-900 outline-none transition-colors focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10"
        >
          {dialOptions.map((o) => (
            <option key={o.dial + o.code} value={o.dial}>
              {flagEmoji(o.code)} {o.dial}
            </option>
          ))}
        </select>
        <input
          id={`${name}-number`}
          type="tel"
          inputMode="tel"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="300 000 0000"
          className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10"
        />
      </div>
      <input type="hidden" name={name} value={combined} />
    </div>
  );
}
