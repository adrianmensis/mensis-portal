import { withAuth, json } from "@/lib/api/middleware";
import { listOpportunities, createOpportunity } from "@/lib/services/opportunities";

export const GET = withAuth(async ({ supabase, request }) => {
  const url = new URL(request.url);
  const filters = {
    partner: url.searchParams.get("partner") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
  };
  const withPartner = url.searchParams.get("withPartner") === "1";
  return listOpportunities(supabase, filters, { withPartner });
});

export const POST = withAuth(async ({ supabase, user, request }) => {
  const body = await request.json().catch(() => ({}));
  const num = (v: unknown) => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  try {
    const opp = await createOpportunity(supabase, user.id, {
      client_name: String(body.client_name ?? ""),
      website: String(body.website ?? "").trim(),
      collaborators: num(body.collaborators),
      estimated_avatars: num(body.estimated_avatars),
      notes: String(body.notes ?? "").trim(),
    });
    return json(opp, 201);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Failed" }, 400);
  }
});
