"use client";

import Link from "next/link";
import { api } from "@/lib/api/client";
import { useResource } from "@/lib/api/use-resource";
import { fmtCurrency } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { LoadingRow } from "@/components/ui/spinner";
import { CreatePartnerModal } from "@/components/partners/create-partner-modal";
import type { Role } from "@/lib/types";

export function DashboardView({
  role,
  fullName,
}: {
  role: Role;
  fullName: string | null;
}) {
  const isAdmin = role === "admin";
  const { data, loading, error, reload } = useResource(() => api.dashboard());

  const action = isAdmin ? (
    <CreatePartnerModal onCreated={reload} />
  ) : (
    <Link href="/app/opportunities/new">
      <Button>+ Register opportunity</Button>
    </Link>
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={isAdmin ? "Dashboard" : `Welcome, ${fullName ?? "Partner"}`}
        subtitle={
          isAdmin
            ? "Network-wide view of partners and pipeline."
            : "Your opportunities and performance with Mensis."
        }
        action={action}
      />

      {loading && <LoadingRow label="Loading dashboard…" />}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p>}

      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isAdmin && <StatCard label="Partners" value={data.partner_count} sub="in network" />}
          <StatCard
            label="Total opportunities"
            value={data.total_opportunities}
            sub={isAdmin ? "across all partners" : "you registered"}
          />
          <StatCard label="Won value" value={fmtCurrency(data.won_value)} sub={`${data.counts.won} closed won`} />
          <StatCard
            label="Open pipeline"
            value={fmtCurrency(data.open_value)}
            sub={`${data.counts.pending + data.counts.approved} active`}
          />
        </div>
      )}
    </div>
  );
}
