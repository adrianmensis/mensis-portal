// Builds a branded, print-optimized quote document and opens it in a new
// window for the browser's "Save as PDF". No PDF dependency — the browser's
// own print-to-PDF does the conversion.

export type QuoteLine = { label: string; sub?: string; value: string };
export type QuoteClient = { empresa?: string; contacto?: string; fecha?: string };

export type QuoteDoc = {
  kind: string; // "Licenciamiento" | "Implementación"
  client: QuoteClient;
  lines: QuoteLine[];
  totals: { label: string; value: string; strong?: boolean }[];
  note?: string;
};

const BRAND = "#273b7c";

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function fmtFecha(iso?: string) {
  if (!iso) return "";
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00`) : new Date(iso);
  return d.toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" });
}

export function openQuotePrint(doc: QuoteDoc) {
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) {
    alert("Permite las ventanas emergentes para descargar la cotización en PDF.");
    return;
  }

  const origin = window.location.origin;
  const fecha = doc.client.fecha ? fmtFecha(doc.client.fecha) : "";

  const clientRows = [
    doc.client.empresa && ["Cliente / Empresa", doc.client.empresa],
    doc.client.contacto && ["Contacto", doc.client.contacto],
    fecha && ["Fecha", fecha],
  ].filter(Boolean) as [string, string][];

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Cotización ${esc(doc.kind)} · Mensis</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #18181b; margin: 0; padding: 48px 56px; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid ${BRAND}; padding-bottom: 20px; }
  .head img { height: 40px; }
  .head .meta { text-align: right; }
  .kind { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: ${BRAND}; }
  h1 { font-size: 22px; margin: 6px 0 0; }
  .client { margin: 28px 0; display: grid; grid-template-columns: max-content 1fr; gap: 6px 18px; font-size: 13px; }
  .client dt { color: #71717a; }
  .client dd { margin: 0; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { text-align: left; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: #a1a1aa; border-bottom: 1px solid #e4e4e7; padding: 0 0 8px; }
  th.r, td.r { text-align: right; }
  td { padding: 11px 0; border-bottom: 1px solid #f4f4f5; font-size: 13px; vertical-align: top; }
  td .sub { display: block; font-size: 11px; color: #a1a1aa; margin-top: 2px; }
  .totals { margin-top: 18px; margin-left: auto; width: 280px; }
  .totals .row { display: flex; justify-content: space-between; padding: 7px 0; font-size: 13px; color: #52525b; }
  .totals .row.strong { border-top: 2px solid ${BRAND}; margin-top: 4px; padding-top: 12px; font-size: 18px; font-weight: 700; color: ${BRAND}; }
  .note { margin-top: 28px; background: #f4f6fb; border-radius: 12px; padding: 14px 16px; font-size: 12px; color: #52525b; }
  .foot { margin-top: 40px; border-top: 1px solid #e4e4e7; padding-top: 14px; font-size: 11px; color: #a1a1aa; display: flex; justify-content: space-between; }
  @media print { body { padding: 24px 32px; } @page { margin: 16mm; } }
</style>
</head>
<body>
  <div class="head">
    <img src="${origin}/logo.png" alt="Mensis" onerror="this.style.display='none'" />
    <div class="meta">
      <span class="kind">Cotización · ${esc(doc.kind)}</span>
      <h1>Propuesta comercial</h1>
    </div>
  </div>

  ${
    clientRows.length
      ? `<dl class="client">${clientRows
          .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`)
          .join("")}</dl>`
      : `<div style="height:24px"></div>`
  }

  <table>
    <thead><tr><th>Concepto</th><th class="r">Monto</th></tr></thead>
    <tbody>
      ${doc.lines
        .map(
          (l) =>
            `<tr><td>${esc(l.label)}${l.sub ? `<span class="sub">${esc(l.sub)}</span>` : ""}</td><td class="r">${esc(l.value)}</td></tr>`,
        )
        .join("")}
    </tbody>
  </table>

  <div class="totals">
    ${doc.totals
      .map(
        (t) =>
          `<div class="row${t.strong ? " strong" : ""}"><span>${esc(t.label)}</span><span>${esc(t.value)}</span></div>`,
      )
      .join("")}
  </div>

  ${doc.note ? `<div class="note">${esc(doc.note)}</div>` : ""}

  <div class="foot">
    <span>Mensis — Digital Twins para tu organización</span>
    <span>mensismentor.com</span>
  </div>

  <script>window.onload = function () { window.focus(); window.print(); };<\/script>
</body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
}
