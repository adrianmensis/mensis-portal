// Exportación a CSV para los botones "Descargar" de las tablas.

export type CsvColumn<T> = {
  header: string;
  value: (row: T) => string | number | null | undefined;
};

// Comillas dobles siempre: un nombre con coma, un salto de línea en las notas o
// unas comillas dentro del texto rompen el archivo si se escriben crudos.
function cell(value: string | number | null | undefined) {
  if (value === null || value === undefined) return '""';
  return `"${String(value).replace(/"/g, '""')}"`;
}

export function toCsv<T>(columns: CsvColumn<T>[], rows: T[]) {
  const lines = [
    columns.map((c) => cell(c.header)).join(","),
    ...rows.map((row) => columns.map((c) => cell(c.value(row))).join(",")),
  ];
  // CRLF + BOM: sin ellos Excel en Windows abre el archivo con los acentos rotos.
  return "﻿" + lines.join("\r\n");
}

// Nombre de archivo con la fecha del día, p. ej. "partners-2026-07-28.csv".
export function stampedFilename(prefix: string) {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${prefix}-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.csv`;
}

export function downloadCsv(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
