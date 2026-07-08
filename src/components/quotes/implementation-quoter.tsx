"use client";

import { fmtCurrency } from "@/lib/format";
import {
  useImplementationQuote,
  IMPLEMENTATION_ACTIVITIES,
} from "@/lib/hooks/use-implementation-quote";
import { NumberField } from "@/components/ui/number-field";
import { InfoTooltip } from "@/components/ui/tooltip";
import { QuoteDownload } from "./quote-download";

export function ImplementationQuoter() {
  const q = useImplementationQuote();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField label="Usuarios (gemelos digitales + consumidores)" defaultValue={100} onValue={q.setUsuarios} />
            <NumberField label="Precio hora consultor (LATAM)" prefix="$" suffix="/h" defaultValue={30} onValue={q.setRate} />
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <div className="grid min-w-[480px] grid-cols-[1fr_110px_100px] gap-3 border-b border-zinc-100 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              <span>Actividad</span>
              <span className="text-right">Horas</span>
              <span className="text-right">Subtotal</span>
            </div>
            {IMPLEMENTATION_ACTIVITIES.map((a) => {
              const counted = q.isCounted(a.key);
              const h = counted ? q.hours[a.key] ?? 0 : 0;
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
                          checked={q.includeDatos}
                          onChange={(e) => q.setIncludeDatos(e.target.checked)}
                          className="h-3 w-3 accent-brand"
                        />
                        Incluir (si aplica)
                      </label>
                    )}
                    {"perUsers" in a && a.perUsers && (
                      <div className="text-[11px] text-zinc-400">Para {q.usuarios.toLocaleString()} usuarios</div>
                    )}
                  </div>
                  <div>
                    <NumberField
                      defaultValue={a.def}
                      suffix="h"
                      onValue={(v) => q.setHour(a.key, v)}
                    />
                  </div>
                  <div className="text-right text-sm font-medium text-zinc-800">{fmtCurrency(h * q.rate)}</div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-zinc-400">
            Herramienta de apoyo — estimado orientativo. La primera actividad es la{" "}
            <strong className="font-medium text-zinc-500">solicitud de creación del tenant de Mensis</strong>.
            Ajusta horas y tarifa según el alcance.
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-brand/15 bg-brand/[0.03] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">Implementación</p>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-zinc-500">Total horas</span>
            <span className="text-2xl font-bold text-zinc-900">{q.totalHoras} h</span>
          </div>
          <div className="h-px bg-brand/10" />
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-zinc-500">Total implementación</span>
            <span className="text-3xl font-bold text-brand">{fmtCurrency(q.total)}</span>
          </div>
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
            100% es tu ganancia — la implementación no tiene comisión Mensis.
          </p>
          <div className="mt-2 flex flex-col gap-1 text-xs text-zinc-500">
            <div className="flex justify-between"><span>Usuarios</span><span>{q.usuarios.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Tarifa consultor</span><span>{fmtCurrency(q.rate)}/h</span></div>
          </div>
        </div>
      </div>

      <QuoteDownload build={q.buildDoc} />
    </div>
  );
}
