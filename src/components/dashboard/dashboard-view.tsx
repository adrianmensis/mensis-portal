"use client";

import Link from "next/link";
import { api } from "@/lib/api/client";
import { useResource } from "@/lib/hooks/use-resource";
import { fmtCurrency } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { LoadingRow } from "@/components/ui/spinner";
import { CreatePartnerModal } from "@/components/partners/create-partner-modal";
import { canManagePartners } from "@/lib/auth/permissions";
import type { Role } from "@/lib/types";

export function DashboardView({
  role,
  fullName,
}: {
  role: Role;
  fullName: string | null;
}) {
  // Both admin and partner_admin run the network; the stats they see are
  // narrowed by RLS, not by this flag.
  const isAdmin = canManagePartners(role);
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
          <StatCard label="Clientes" value={fmtCurrency(data.won_value)} sub={`${data.counts.client} cerrados`} />
          <StatCard
            label="Pipeline activo"
            value={fmtCurrency(data.open_value)}
            sub={`${data.total_opportunities - data.counts.client - data.counts.closed_lost} activas · ${data.counts.closed_lost} perdidas`}
          />
        </div>
      )}
    </div>
  );
}
