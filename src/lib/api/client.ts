import type { Material, Opportunity, OpportunityStatus, Profile } from "@/lib/types";
import type { PartnerWithCount, CreatePartnerInput } from "@/lib/services/partners";
import type { OpportunityWithPartner, CreateOpportunityInput, OpportunityFilters } from "@/lib/services/opportunities";
import type { DashboardData } from "@/lib/services/dashboard";

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status})`);
  return data as T;
}

function qs(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// Typed client over the /api/* microservices. The single boundary the UI
// uses to talk to the backend.
export const api = {
  me: () => request<Profile>("GET", "/api/me"),
  dashboard: () => request<DashboardData>("GET", "/api/dashboard"),

  partners: {
    list: () => request<PartnerWithCount[]>("GET", "/api/partners"),
    create: (input: CreatePartnerInput) =>
      request<{ email: string; password: string }>("POST", "/api/partners", input),
    setActive: (id: string, active: boolean) =>
      request<{ id: string; active: boolean }>("POST", `/api/partners/${id}/active`, { active }),
    resetPassword: (id: string) =>
      request<{ password: string }>("POST", `/api/partners/${id}/password`),
  },

  materials: {
    list: () => request<Material[]>("GET", "/api/materials"),
    upload: async (input: { title: string; description?: string; file: File }) => {
      const form = new FormData();
      form.set("title", input.title);
      if (input.description) form.set("description", input.description);
      form.set("file", input.file);
      const res = await fetch("/api/materials", { method: "POST", body: form });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status})`);
      return data as Material;
    },
    remove: (id: string) => request<{ id: string }>("DELETE", `/api/materials/${id}`),
  },

  opportunities: {
    list: (filters: OpportunityFilters & { withPartner?: boolean } = {}) =>
      request<OpportunityWithPartner[]>(
        "GET",
        "/api/opportunities" +
          qs({
            partner: filters.partner,
            status: filters.status,
            withPartner: filters.withPartner ? "1" : undefined,
          }),
      ),
    create: (input: CreateOpportunityInput) =>
      request<Opportunity>("POST", "/api/opportunities", input),
    setStatus: (id: string, status: OpportunityStatus) =>
      request<{ id: string; status: OpportunityStatus }>(
        "POST",
        `/api/opportunities/${id}/status`,
        { status },
      ),
  },
};
