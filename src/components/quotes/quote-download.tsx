"use client";

import { useState } from "react";
import { openQuotePrint, type QuoteClient, type QuoteDoc } from "@/lib/quote-print";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

function today() {
  return new Date().toISOString().slice(0, 10);
}

// Captures optional client/prospect details and downloads the quote as a
// branded PDF (via print). `build` is called at click time with the latest
// computed quote, so it always reflects the current inputs.
export function QuoteDownload({ build }: { build: (client: QuoteClient) => QuoteDoc }) {
  const [empresa, setEmpresa] = useState("");
  const [contacto, setContacto] = useState("");
  const [fecha, setFecha] = useState(today());

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6">
      <div>
        <h3 className="text-sm font-semibold text-zinc-800">Datos para la cotización</h3>
        <p className="mt-0.5 text-xs text-zinc-400">Opcionales — aparecerán en el PDF para tu prospecto.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Cliente / Empresa" htmlFor="q-empresa">
          <Input id="q-empresa" value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Nombre de la empresa" />
        </Field>
        <Field label="Contacto" htmlFor="q-contacto">
          <Input id="q-contacto" value={contacto} onChange={(e) => setContacto(e.target.value)} placeholder="Nombre del contacto" />
        </Field>
        <Field label="Fecha" htmlFor="q-fecha">
          <Input id="q-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </Field>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => openQuotePrint(build({ empresa: empresa.trim(), contacto: contacto.trim(), fecha }))}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Descargar PDF
        </Button>
      </div>
    </div>
  );
}
