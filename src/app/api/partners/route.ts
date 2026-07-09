import { withPartnerAdmin, json } from "@/lib/api/middleware";
import { listPartners, createPartner } from "@/lib/services/partners";

export const GET = withPartnerAdmin(async ({ supabase }) => {
  return listPartners(supabase);
});

export const POST = withPartnerAdmin(async ({ admin, request }) => {
  const body = await request.json().catch(() => ({}));
  const full_name = String(body.full_name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!full_name) return json({ error: "Name is required." }, 400);
  if (!email) return json({ error: "Email is required." }, 400);

  try {
    // createPartner clamps `role` and `category` to their allowed values, so a
    // crafted body can never mint an admin.
    const result = await createPartner(admin, {
      full_name,
      email,
      country: String(body.country ?? "").trim(),
      phone: String(body.phone ?? "").trim(),
      referred_by: String(body.referred_by ?? "").trim(),
      entry_date: String(body.entry_date ?? "").trim(),
      process_stage: String(body.process_stage ?? "").trim(),
      linkedin_url: String(body.linkedin_url ?? "").trim(),
      category: body.category || null,
      reference: String(body.reference ?? "").trim(),
      role: body.role,
    });
    return json(result, 201);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Failed" }, 400);
  }
});
