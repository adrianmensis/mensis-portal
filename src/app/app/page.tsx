import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard · Mensis",
};

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const [contactsRes, partnersRes, trialsRes, clientsRes, goalsRes] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("partners").select("*", { count: "exact", head: true }),
    supabase.from("trials").select("avatar_count, user_count, employee_count"),
    supabase.from("clients").select("avatar_count, price_per_avatar, user_count"),
    supabase
      .from("goals")
      .select("current_avatars, target_avatars, target_partners, month")
      .order("month", { ascending: false })
      .limit(1),
  ]);

  const totalContacts = contactsRes.count ?? 0;
  const totalPartners = partnersRes.count ?? 0;
  const trials = trialsRes.data ?? [];
  const clients = clientsRes.data ?? [];

  const totalAvatars = clients.reduce((s, c) => s + c.avatar_count, 0);
  const trialAvatars = trials.reduce((s, t) => s + t.avatar_count, 0);
  const clientUsers = clients.reduce((s, c) => s + c.user_count, 0);
  const trialUsers = trials.reduce((s, t) => s + t.user_count, 0);
  const mrr = clients.reduce((s, c) => s + c.avatar_count * c.price_per_avatar, 0);


  const annualGoal = goalsRes.data?.[0];
  const targetAvatars = annualGoal?.target_avatars ?? 0;
  const targetPartners = annualGoal?.target_partners ?? 0;
  const partnerPct = targetPartners > 0 ? Math.round((totalPartners / targetPartners) * 100) : 0;
  const allAvatars = totalAvatars + trialAvatars;
  const goalPct = targetAvatars > 0 ? Math.round((allAvatars / targetAvatars) * 100) : 0;

  const avgPrice =
    clients.length > 0
      ? clients.reduce((s, c) => s + c.price_per_avatar, 0) / clients.length
      : 0;
  const targetRevenue = targetAvatars * avgPrice;
  const revenuePct = targetRevenue > 0 ? Math.round((mrr / targetRevenue) * 100) : 0;

  const trialRevenue = trials.reduce((s, t) => s + t.avatar_count * avgPrice, 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Overview of your pipeline, revenue, and goals.
        </p>
      </div>

      {/* Row 1: Revenue & Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">MRR</p>
          <p className="mt-3 text-4xl font-bold text-zinc-900">{fmtCurrency(mrr)}</p>
          <p className="mt-1 text-xs text-zinc-400">Avg {fmtCurrency(avgPrice)}/avatar · {clients.length} client{clients.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Client Avatars</p>
          <p className="mt-3 text-4xl font-bold text-zinc-900">{totalAvatars}</p>
          <p className="mt-1 text-xs text-zinc-400">{clients.length} paying client{clients.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Platform Users</p>
          <p className="mt-3 text-4xl font-bold text-zinc-900">{clientUsers.toLocaleString()}</p>
          <p className="mt-1 text-xs text-zinc-400">{trialUsers.toLocaleString()} in pipeline (trials)</p>
        </div>
      </div>

      {/* Row 2: Pipeline conversion — what's moving */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Trial Avatars</p>
          <p className="mt-3 text-4xl font-bold text-zinc-900">{trialAvatars}</p>
          <p className="mt-1 text-xs text-zinc-400">{trials.length} trial{trials.length !== 1 ? "s" : ""} converting</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Contacts</p>
          <p className="mt-3 text-4xl font-bold text-zinc-900">{totalContacts}</p>
          <p className="mt-1 text-xs text-zinc-400">Leads in pipeline</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Partners</p>
          <p className="mt-3 text-4xl font-bold text-zinc-900">{totalPartners}</p>
          <p className="mt-1 text-xs text-zinc-400">{partnerPct}% of {targetPartners} target</p>
        </div>
      </div>

      {/* Pipeline bars */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Revenue Pipeline</p>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-baseline gap-4">
              <div>
                <span className="text-xs text-zinc-400">Trials</span>
                <span className="ml-1.5 text-xl font-bold text-zinc-900">{fmtCurrency(trialRevenue)}</span>
              </div>
              <span className="text-zinc-300">+</span>
              <div>
                <span className="text-xs text-zinc-400">Clients</span>
                <span className="ml-1.5 text-xl font-bold text-zinc-900">{fmtCurrency(mrr)}</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-zinc-400">Total</span>
              <span className="ml-1.5 text-xl font-bold text-brand">{fmtCurrency(trialRevenue + mrr)}</span>
            </div>
          </div>
          <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-zinc-100">
            {trialRevenue > 0 && (
              <div className="bg-brand/40" style={{ width: `${(trialRevenue / (trialRevenue + mrr)) * 100}%` }} />
            )}
            {mrr > 0 && (
              <div className="bg-brand" style={{ width: `${(mrr / (trialRevenue + mrr)) * 100}%` }} />
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Avatar Pipeline</p>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-baseline gap-4">
              <div>
                <span className="text-xs text-zinc-400">Trials</span>
                <span className="ml-1.5 text-xl font-bold text-zinc-900">{trialAvatars}</span>
              </div>
              <span className="text-zinc-300">+</span>
              <div>
                <span className="text-xs text-zinc-400">Clients</span>
                <span className="ml-1.5 text-xl font-bold text-zinc-900">{totalAvatars}</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-zinc-400">Total</span>
              <span className="ml-1.5 text-xl font-bold text-brand">{allAvatars}</span>
            </div>
          </div>
          <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-zinc-100">
            {trialAvatars > 0 && (
              <div className="bg-brand/40" style={{ width: `${(trialAvatars / allAvatars) * 100}%` }} />
            )}
            {totalAvatars > 0 && (
              <div className="bg-brand" style={{ width: `${(totalAvatars / allAvatars) * 100}%` }} />
            )}
          </div>
        </div>
      </div>

      {/* Goals — long-term targets */}
      <div className="grid gap-4 sm:grid-cols-3">
        <GoalCard
          label="2026 Revenue Goal"
          current={mrr}
          target={targetRevenue}
          pct={revenuePct}
          isCurrency
          sub={`Avg ${fmtCurrency(avgPrice)}/avatar`}
        />
        <GoalCard
          label="2026 Avatar Goal"
          current={allAvatars}
          target={targetAvatars}
          pct={goalPct}
          sub={`${totalAvatars} paying + ${trialAvatars} trial`}
        />
        <GoalCard
          label="2026 Partner Goal"
          current={totalPartners}
          target={targetPartners}
          pct={partnerPct}
          sub={`${targetPartners - totalPartners} partners remaining`}
        />
      </div>
    </div>
  );
}

function GoalCard({
  label,
  current,
  target,
  pct,
  sub,
  isCurrency,
}: {
  label: string;
  current: number;
  target: number;
  pct: number;
  sub: string;
  isCurrency?: boolean;
}) {
  const fmt = (n: number) =>
    isCurrency
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n)
      : n.toString();

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">{label}</p>
        <span className="rounded-full bg-brand/8 px-2.5 py-0.5 text-xs font-bold text-brand">{pct}%</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-zinc-900">
        {fmt(current)}
        <span className="text-base font-normal text-zinc-400"> / {fmt(target)}</span>
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100">
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-zinc-400">{sub}</p>
    </div>
  );
}
