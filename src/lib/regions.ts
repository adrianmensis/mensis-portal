// Región comercial de un país. Sirve para leer el pipeline por mercado sin
// tener que mirar veinte banderas: el corte útil para Mensis es Centroamérica /
// Sudamérica / Norteamérica / Europa, no el país uno por uno.

export type Region =
  | "centroamerica"
  | "sudamerica"
  | "norteamerica"
  | "europa"
  | "otra"
  | "sin_pais";

// Orden fijo: el mismo en la dona, en la leyenda y en cualquier tabla. "Sin
// país" va último — es una ausencia de dato, no un mercado.
export const REGIONS: Region[] = [
  "centroamerica",
  "sudamerica",
  "norteamerica",
  "europa",
  "otra",
  "sin_pais",
];

export const REGION_LABELS: Record<Region, string> = {
  centroamerica: "Centroamérica y Caribe",
  sudamerica: "Sudamérica",
  norteamerica: "Norteamérica",
  europa: "Europa",
  otra: "Otras regiones",
  sin_pais: "Sin país",
};

const CENTROAMERICA = new Set([
  "BZ", "CR", "SV", "GT", "HN", "NI", "PA",
  "CU", "DO", "HT", "JM", "PR", "TT", "BB", "BS", "AG", "DM", "GD", "KN", "LC",
  "VC", "AW", "CW", "SX", "KY", "VG", "VI", "TC",
]);

const SUDAMERICA = new Set([
  "AR", "BO", "BR", "CL", "CO", "EC", "GY", "PE", "PY", "SR", "UY", "VE", "GF", "FK",
]);

const NORTEAMERICA = new Set(["MX", "US", "CA"]);

const EUROPA = new Set([
  "ES", "PT", "FR", "IT", "DE", "GB", "IE", "NL", "BE", "LU", "CH", "AT", "SE",
  "NO", "DK", "FI", "IS", "PL", "CZ", "SK", "HU", "RO", "BG", "GR", "HR", "SI",
  "RS", "BA", "ME", "MK", "AL", "EE", "LV", "LT", "UA", "BY", "MD", "MT", "CY", "AD",
]);

export function regionOf(country: string | null | undefined): Region {
  if (!country) return "sin_pais";
  const code = country.toUpperCase();
  if (CENTROAMERICA.has(code)) return "centroamerica";
  if (SUDAMERICA.has(code)) return "sudamerica";
  if (NORTEAMERICA.has(code)) return "norteamerica";
  if (EUROPA.has(code)) return "europa";
  return "otra";
}
