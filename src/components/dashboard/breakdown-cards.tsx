import { fmtCurrency } from "@/lib/format";
import { REGIONS, REGION_LABELS, regionOf, type Region } from "@/lib/regions";
import type { OpportunityPulse } from "@/lib/services/dashboard";
import { Donut, DONUT_COLORS, DONUT_NEUTRAL, type DonutSlice } from "@/components/ui/donut";

function Card({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">{title}</p>
        <span className="text-[11px] text-zinc-400">{hint}</span>
      </div>
      {children}
    </section>
  );
}

function Empty() {
  return <p className="py-8 text-center text-sm text-zinc-400">Todavía no hay oportunidades.</p>;
}

// Reparto por mercado. Las regiones toman color por su lugar en el orden fijo,
// nunca por tamaño: si mañana Sudamérica pasa a Centroamérica, cada una sigue
// con su tinta. "Sin país" va en gris — es un dato que falta, no un mercado.
export function RegionBreakdown({ opportunities }: { opportunities: OpportunityPulse[] }) {
  const byRegion = new Map<Region, { count: number; value: number }>(
    REGIONS.map((r) => [r, { count: 0, value: 0 }]),
  );
  for (const o of opportunities) {
    const cell = byRegion.get(regionOf(o.country))!;
    cell.count += 1;
    cell.value += o.value;
  }

  // El color sale del lugar de la región en REGIONS, no de su posición entre
  // las que hoy tienen datos: si una región se queda en cero, las otras no se
  // repintan.
  const slices: DonutSlice[] = REGIONS.map((r, i) => ({
    key: r,
    label: REGION_LABELS[r],
    value: byRegion.get(r)!.count,
    note: fmtCurrency(byRegion.get(r)!.value),
    color: r === "sin_pais" ? DONUT_NEUTRAL : DONUT_COLORS[i],
  })).filter((s) => s.value > 0);

  return (
    <Card title="Por región" hint="oportunidades · monto anual">
      {opportunities.length === 0 ? (
        <Empty />
      ) : (
        <Donut slices={slices} total={opportunities.length} centerLabel="total" />
      )}
    </Card>
  );
}

// Negocio propio contra negocio de la red. "Mensis" son las oportunidades que
// registró una cuenta admin; todo lo demás lo trajo un partner.
export function OriginBreakdown({ opportunities }: { opportunities: OpportunityPulse[] }) {
  const partner = opportunities.filter((o) => o.origin === "partner");
  const mensis = opportunities.filter((o) => o.origin === "mensis");
  const sum = (rows: OpportunityPulse[]) => rows.reduce((s, o) => s + o.value, 0);

  const slices: DonutSlice[] = [
    {
      key: "partner",
      label: "Red de partners",
      value: partner.length,
      note: fmtCurrency(sum(partner)),
      color: DONUT_COLORS[0],
    },
    {
      key: "mensis",
      label: "Mensis",
      value: mensis.length,
      note: fmtCurrency(sum(mensis)),
      color: DONUT_COLORS[1],
    },
  ];

  return (
    <Card title="Por origen" hint="oportunidades · monto anual">
      {opportunities.length === 0 ? (
        <Empty />
      ) : (
        <Donut slices={slices} total={opportunities.length} centerLabel="total" />
      )}
    </Card>
  );
}
