"use client";

import { downloadCsv, stampedFilename, toCsv, type CsvColumn } from "@/lib/csv";

// Botón "Descargar" de las tablas: baja a CSV las filas que se le pasen —
// normalmente las filtradas, no solo la página visible.
export function DownloadButton<T>({
  prefix,
  columns,
  rows,
  label = "Descargar",
}: {
  prefix: string;
  columns: CsvColumn<T>[];
  rows: T[];
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => downloadCsv(stampedFilename(prefix), toCsv(columns, rows))}
      disabled={rows.length === 0}
      className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M4 21h16" />
      </svg>
      {label}
    </button>
  );
}
