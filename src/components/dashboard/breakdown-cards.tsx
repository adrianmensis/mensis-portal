import { fmtCurrency, fmtCurrencyCompact } from "@/lib/format";
import { REGIONS, REGION_LABELS, regionOf, type Region } from "@/lib/regions";
import type { OpportunityPulse } from "@/lib/services/dashboard";
import { Donut, DONUT_COLORS, DONUT_NEUTRAL, type DonutSlice } from "@/components/ui/donut";

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
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

// Reparto por mercado, por cantidad de oportunidades. Las regiones toman color
// por su lugar en el orden fijo, nunca por tamaño: si mañana Sudamérica pasa a
// Centroamérica, cada una sigue con su tinta. "Sin país" va en gris — es un
// dato que falta, no un mercado.
export function RegionBreakdown({ opportunities }: { opportunities: OpportunityPulse[] }) {
  const byRegion = new Map<Region, { count: number; value: number }>(
    REGIONS.map((r) => [r, { count: 0, value: 0 }]),
  );
  for (const o of opportunities) {
    const cell = byRegion.get(regionOf(o.country))!;
    cell.count += 1;
    cell.value += o.value;
  }

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
        <Donut
          slices={slices}
          total={opportunities.length}
          centerValue={String(opportunities.length)}
          centerLabel="total"
        />
      )}
    </Card>
  );
}

// Negocio propio contra negocio de la red, en plata. "Mensis" son las
// oportunidades que registró una cuenta admin; todo lo demás lo trajo un
// partner. Va en tres cortes porque no es lo mismo tener leads que tener
// clientes: el reparto cambia mucho de un extremo al otro del embudo.
const ORIGIN_GROUPS = [
  { key: "leads", title: "Origen · Leads", match: (s: Group) => s === "leads" },
  { key: "proceso", title: "Origen · En proceso", match: (s: Group) => s === "proceso" },
  { key: "ganadas", title: "Origen · Ganadas", match: (s: Group) => s === "ganadas" },
] as const;

type Group = "leads" | "proceso" | "ganadas" | "perdidas";

function OriginDonut({
  title,
  rows,
}: {
  title: string;
  rows: OpportunityPulse[];
}) {
  const partner = rows.filter((o) => o.origin === "partner");
  const mensis = rows.filter((o) => o.origin === "mensis");
  const sum = (list: OpportunityPulse[]) => list.reduce((s, o) => s + o.value, 0);
  const total = sum(rows);

  const slices: DonutSlice[] = [
    {
      key: "partner",
      // Corto a propósito: la leyenda vive en una tarjeta de un tercio de
      // ancho, y "Red de partners" se cortaba a la mitad.
      label: "Partners",
      value: sum(partner),
      display: fmtCurrency(sum(partner)),
      note: `${partner.length} opp${partner.length === 1 ? "" : "s"}`,
      color: DONUT_COLORS[0],
    },
    {
      key: "mensis",
      label: "Mensis",
      value: sum(mensis),
      display: fmtCurrency(sum(mensis)),
      note: `${mensis.length} opp${mensis.length === 1 ? "" : "s"}`,
      color: DONUT_COLORS[1],
    },
  ];

  return (
    <Card title={title} hint={`${rows.length} oportunidad${rows.length === 1 ? "" : "es"}`}>
      {rows.length === 0 ? (
        <Empty />
      ) : (
        <Donut
          slices={slices}
          total={total}
          centerValue={fmtCurrencyCompact(total)}
          centerLabel="anual"
          size={132}
          layout="column"
        />
      )}
    </Card>
  );
}

export function OriginBreakdown({ opportunities }: { opportunities: OpportunityPulse[] }) {
  const group = (o: OpportunityPulse): Group =>
    o.stage === "lead"
      ? "leads"
      : o.stage === "client"
        ? "ganadas"
        : o.stage === "closed_lost"
          ? "perdidas"
          : "proceso";

  return (
    <>
      {ORIGIN_GROUPS.map((g) => (
        <OriginDonut
          key={g.key}
          title={g.title}
          rows={opportunities.filter((o) => g.match(group(o)))}
        />
      ))}
    </>
  );
}
