import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Roadmap · Mensis",
};

type Objective = {
  id: string;
  name: string;
  description: string | null;
  category: "sales" | "product" | "fundraising";
  status: "not_started" | "in_progress" | "completed";
  target_date: string | null;
  progress: number;
  sort_order: number;
};

const STATUS_STYLES: Record<string, string> = {
  not_started: "bg-zinc-50 text-zinc-500 ring-zinc-200",
  in_progress: "bg-blue-50 text-blue-700 ring-blue-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
};

const CATEGORY_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  sales: { label: "Sales & Growth", icon: "trending-up", color: "text-brand" },
  product: { label: "Product", icon: "code", color: "text-violet-600" },
  fundraising: { label: "Fundraising", icon: "dollar", color: "text-amber-600" },
};

export default async function GoalsPage() {
  const supabase = await createClient();

  const [clientsRes, trialsRes, partnersRes, objectivesRes, goalsRes] = await Promise.all([
    supabase.from("clients").select("avatar_count"),
    supabase.from("trials").select("avatar_count"),
    supabase.from("partners").select("*", { count: "exact", head: true }),
    supabase.from("objectives").select("*").order("sort_order", { ascending: true }),
    supabase.from("goals").select("target_avatars, target_partners").order("month", { ascending: false }).limit(1),
  ]);

  const clientAvatars = (clientsRes.data ?? []).reduce((s, c) => s + c.avatar_count, 0);
  const trialAvatars = (trialsRes.data ?? []).reduce((s, t) => s + t.avatar_count, 0);
  const totalAvatars = clientAvatars + trialAvatars;
  const totalPartners = partnersRes.count ?? 0;

  const targetAvatars = goalsRes.data?.[0]?.target_avatars ?? 600;
  const targetPartners = goalsRes.data?.[0]?.target_partners ?? 100;

  const objectives = (objectivesRes.data ?? []) as Objective[];
  const salesObjs = objectives.filter((o) => o.category === "sales");
  const productObjs = objectives.filter((o) => o.category === "product");
  const fundraisingObjs = objectives.filter((o) => o.category === "fundraising");

  const avatarPct = targetAvatars > 0 ? Math.round((totalAvatars / targetAvatars) * 100) : 0;
  const partnerPct = targetPartners > 0 ? Math.round((totalPartners / targetPartners) * 100) : 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Roadmap
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          2026 strategic objectives — sales, product, and fundraising.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <KpiCard
          label="Avatar Goal"
          current={totalAvatars}
          target={targetAvatars}
          pct={avatarPct}
          detail={`${clientAvatars} clients + ${trialAvatars} trials`}
          color="bg-brand"
        />
        <KpiCard
          label="Partner Goal"
          current={totalPartners}
          target={targetPartners}
          pct={partnerPct}
          detail={`${targetPartners - totalPartners} partners remaining`}
          color="bg-violet-500"
        />
      </div>

      {/* Objectives by Category */}
      <ObjectiveSection
        title="Sales & Growth"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        }
        objectives={salesObjs}
        liveData={{ "600 Avatars": avatarPct, "100 Partners": partnerPct }}
      />

      <ObjectiveSection
        title="Product"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        }
        objectives={productObjs}
      />

      <ObjectiveSection
        title="Fundraising"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        }
        objectives={fundraisingObjs}
      />
    </div>
  );
}

function KpiCard({
  label,
  current,
  target,
  pct,
  detail,
  color,
}: {
  label: string;
  current: number;
  target: number;
  pct: number;
  detail: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">{label}</p>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${pct >= 100 ? "bg-emerald-50 text-emerald-700" : "bg-brand/8 text-brand"}`}>
          {pct}%
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold text-zinc-900">
        {current}
        <span className="text-lg font-normal text-zinc-400"> / {target}</span>
      </p>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-zinc-100">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-zinc-400">{detail}</p>
    </div>
  );
}

function ObjectiveSection({
  title,
  icon,
  objectives,
  liveData,
}: {
  title: string;
  icon: React.ReactNode;
  objectives: Objective[];
  liveData?: Record<string, number>;
}) {
  if (objectives.length === 0) return null;

  const completed = objectives.filter((o) => o.status === "completed").length;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
        </div>
        <span className="text-xs text-zinc-400">
          {completed}/{objectives.length} completed
        </span>
      </div>
      <div className="divide-y divide-zinc-50">
        {objectives.map((obj) => {
          const pct = liveData?.[obj.name] ?? obj.progress;

          return (
            <div key={obj.id} className="flex items-start gap-4 px-5 py-4">
              <div className="mt-0.5">
                {obj.status === "completed" ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                ) : obj.status === "in_progress" ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                  </div>
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-zinc-200" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${obj.status === "completed" ? "text-zinc-400 line-through" : "text-zinc-900"}`}>
                    {obj.name}
                  </p>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${STATUS_STYLES[obj.status]}`}>
                    {STATUS_LABELS[obj.status]}
                  </span>
                </div>
                {obj.description && (
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">{obj.description}</p>
                )}
                {pct > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 w-32 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-emerald-500" : "bg-brand"}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] tabular-nums text-zinc-400">{pct}%</span>
                  </div>
                )}
              </div>
              {obj.target_date && (
                <p className="shrink-0 text-xs text-zinc-400">
                  {new Date(obj.target_date + "T00:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
