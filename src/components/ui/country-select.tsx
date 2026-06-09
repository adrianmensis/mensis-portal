import { COUNTRIES, flagEmoji } from "@/lib/countries";
import { Label } from "./label";
import { Select } from "./select";

// Native country dropdown. Stores the ISO alpha-2 code (e.g. "CO"); the option
// label shows the flag + name. Uncontrolled — works with plain FormData.
export function CountrySelect({
  name,
  label,
  defaultValue = "",
  required,
  wrapperClassName = "",
}: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  wrapperClassName?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`.trim()}>
      <Label htmlFor={name}>{label}</Label>
      <Select id={name} name={name} defaultValue={defaultValue} required={required}>
        <option value="">Select country…</option>
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {flagEmoji(c.code)} {c.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
