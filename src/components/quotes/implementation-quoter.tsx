"use client";

import { useState } from "react";
import { fmtCurrency } from "@/lib/format";
import { commission, COMMISSION_RATE } from "@/lib/pricing";
import { NumberField } from "@/components/ui/number-field";
import { InfoTooltip } from "@/components/ui/tooltip";

// Implementation activities, in the order they happen during onboarding.
// Everything is estimated in HOURS and multiplied by the consultant rate.
const ACTIVITIES = [
  {
    key: "tenant",
    name: "Solicitud de creación de tenant de Mensis",
    def: 1,
    tooltip: "Primera actividad: se solicita la creación del tenant de Mensis para la empresa.",
  },
  {
    key: "datos",
    name: "Preparación de datos",
    def: 8,
    optional: true,
    tooltip: "Analizar documentos y transcripciones pasadas de la empresa para entrenar la IA inicialmente.",
  },
  { key: "capAdmin", name: "Capacitación a usuarios admin", def: 4 },
  { key: "crearAdmin", name: "Creación de usuarios admin", def: 2 },
  { key: "kickoff", name: "Kickoff de usuarios consumidores", def: 2, perUsers: true },
  {
    key: "crearCons",
    name: "Creación de usuarios consumidores",
    def: 6,
    perUsers: true,
    tooltip: "Integración con Microsoft o Meets y creación de perfil.",
  },
  { key: "capCons", name: "Capacitación de usuarios consumidores", def: 6, perUsers: true },
  { key: "acompanamiento", name: "Acompañamiento inicial", def: 10 },
] as const;

const DEFAULT_HOURS: Record<string, number> = Object.fromEntries(
  ACTIVITIES.map((a) => [a.key, a.def]),
);

export function ImplementationQuoter() {
  const [usuarios, setUsuarios] = useState(100);
  const [rate, setRate] = useState(30);
  const [hours, setHours] = useState<Record<string, number>>(DEFAULT_HOURS);
  const [includeDatos, setIncludeDatos] = useState(true);

  function isCounted(key: string) {
    return key !== "datos" || includeDatos;
  }

  const totalHoras = ACTIVITIES.reduce(
    (sum, a) => sum + (isCounted(a.key) ? hours[a.key] ?? 0 : 0),
    0,
  );
  const total = totalHoras * rate;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <NumberField label="Usuarios (avatares + consumidores)" defaultValue={100} onValue={setUsuarios} />
          <NumberField label="Precio hora consultor (LATAM)" prefix="$" suffix="/h" defaultValue={30} onValue={setRate} />
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <div className="grid min-w-[480px] grid-cols-[1fr_110px_100px] gap-3 border-b border-zinc-100 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            <span>Actividad</span>
            <span className="text-right">Horas</span>
            <span className="text-right">Subtotal</span>
          </div>
          {ACTIVITIES.map((a) => {
            const counted = isCounted(a.key);
            const h = counted ? hours[a.key] ?? 0 : 0;
            return (
              <div
                key={a.key}
                className={`grid min-w-[480px] grid-cols-[1fr_110px_100px] items-center gap-3 border-b border-zinc-50 px-4 py-2.5 last:border-0 ${counted ? "" : "opacity-50"}`}
              >
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-700">
                    {a.name}
                    {"tooltip" in a && a.tooltip && <InfoTooltip text={a.tooltip} />}
                  </div>
                  {"optional" in a && a.optional && (
                    <label className="mt-0.5 inline-flex cursor-pointer items-center gap-1.5 text-[11px] text-zinc-400">
                      <input
                        type="checkbox"
                        checked={includeDatos}
                        onChange={(e) => setIncludeDatos(e.target.checked)}
                        className="h-3 w-3 accent-brand"
                      />
                      Incluir (si aplica)
                    </label>
                  )}
                  {"perUsers" in a && a.perUsers && (
                    <div className="text-[11px] text-zinc-400">Para {usuarios.toLocaleString()} usuarios</div>
                  )}
                </div>
                <div>
                  <NumberField
                    defaultValue={a.def}
                    suffix="h"
                    onValue={(v) => setHours((prev) => ({ ...prev, [a.key]: v }))}
                  />
                </div>
                <div className="text-right text-sm font-medium text-zinc-800">{fmtCurrency(h * rate)}</div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-zinc-400">
          La primera actividad es la <strong className="font-medium text-zinc-500">solicitud de creación del tenant de Mensis</strong>.
          Cotizador básico de implementación — ajusta horas y tarifa según el alcance.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-brand/15 bg-brand/[0.03] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">Implementación</p>
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-zinc-500">Total horas</span>
          <span className="text-2xl font-bold text-zinc-900">{totalHoras} h</span>
        </div>
        <div className="h-px bg-brand/10" />
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-zinc-500">Total implementación</span>
          <span className="text-3xl font-bold text-brand">{fmtCurrency(total)}</span>
        </div>
        <div className="flex items-baseline justify-between rounded-lg bg-brand/8 px-3 py-2">
          <span className="text-xs font-semibold text-brand">Tu comisión ({COMMISSION_RATE * 100}%)</span>
          <span className="text-lg font-bold text-brand">{fmtCurrency(commission(total))}</span>
        </div>
        <div className="mt-2 flex flex-col gap-1 text-xs text-zinc-500">
          <div className="flex justify-between"><span>Usuarios</span><span>{usuarios.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Tarifa consultor</span><span>{fmtCurrency(rate)}/h</span></div>
        </div>
      </div>
    </div>
  );
}
