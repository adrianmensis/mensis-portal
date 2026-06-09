import { withAdmin, json } from "@/lib/api/middleware";
import { listPartners, createPartner } from "@/lib/services/partners";

export const GET = withAdmin(async ({ supabase }) => {
  return listPartners(supabase);
});

export const POST = withAdmin(async ({ admin, request }) => {
  const body = await request.json().catch(() => ({}));
  const full_name = String(body.full_name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!full_name) return json({ error: "Name is required." }, 400);
  if (!email) return json({ error: "Email is required." }, 400);

  const result = await createPartner(admin, {
    full_name,
    email,
    country: String(body.country ?? "").trim(),
    phone: String(body.phone ?? "").trim(),
    referred_by: String(body.referred_by ?? "").trim(),
    entry_date: String(body.entry_date ?? "").trim(),
    process_stage: String(body.process_stage ?? "").trim(),
    linkedin_url: String(body.linkedin_url ?? "").trim(),
  });
  return json(result, 201);
});
