import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Goals · Mensis",
};

const MONTH_FMT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default async function GoalsPage() {
  const supabase = await createClient();
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .order("month", { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Goals
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Monthly avatar targets and progress.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/80">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Month
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Current Avatars
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Target Avatars
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Gap
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Progress
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {goals && goals.length > 0 ? (
              goals.map((g) => {
                const gap = g.target_avatars - g.current_avatars;
                const pct =
                  g.target_avatars > 0
                    ? Math.round((g.current_avatars / g.target_avatars) * 100)
                    : 0;

                return (
                  <tr key={g.id} className="transition-colors hover:bg-blue-50/50">
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {MONTH_FMT.format(new Date(g.month))}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-600">
                      {g.current_avatars}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-600">
                      {g.target_avatars}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`tabular-nums font-medium ${gap > 0 ? "text-amber-600" : "text-emerald-600"}`}
                      >
                        {gap > 0 ? `-${gap}` : gap === 0 ? "0" : `+${Math.abs(gap)}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="ml-auto flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-zinc-100">
                          <div
                            className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-emerald-500" : pct >= 50 ? "bg-blue-500" : "bg-amber-500"}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-xs tabular-nums text-zinc-500">
                          {pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-zinc-400"
                >
                  No goals defined yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
