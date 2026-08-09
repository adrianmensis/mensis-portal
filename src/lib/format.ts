export function fmtBytes(n: number | null | undefined) {
  if (!n) return "";
  const units = ["B", "KB", "MB", "GB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

// Human-friendly opportunity code, e.g. seq 1 → "OPP-0001".
export function opportunityCode(seq: number | null | undefined) {
  return `OPP-${String(seq ?? 0).padStart(4, "0")}`;
}

// Human-friendly partner code, e.g. seq 1 → "PART-0001".
export function partnerCode(seq: number | null | undefined) {
  return `PART-${String(seq ?? 0).padStart(4, "0")}`;
}

export function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

// Monto abreviado: "$90.7K". Para lugares angostos —el centro de una dona— donde
// la cifra completa no entra. El monto exacto siempre se muestra al lado.
export function fmtCurrencyCompact(n: number) {
  if (Math.abs(n) < 1000) return fmtCurrency(n);
  return `$${new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n)}`;
}

export function fmtDate(s: string) {
  // Date-only strings (YYYY-MM-DD) are parsed as local time to avoid an
  // off-by-one day in timezones behind UTC.
  const d = /^\d{4}-\d{2}-\d{2}$/.test(s)
    ? new Date(`${s}T00:00:00`)
    : new Date(s);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
