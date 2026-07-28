import { withPartnerAdmin, json } from "@/lib/api/middleware";
import { setPartnerActive } from "@/lib/services/partners";

export const POST = withPartnerAdmin(async ({ admin, request, params }) => {
  const body = await request.json().catch(() => ({}));
  if (typeof body.active !== "boolean") return json({ error: "`active` boolean required." }, 400);
  // setPartnerActive verifica el perfil y el ban de auth: si algo falla lanza,
  // así que un 200 aquí significa que el cambio quedó aplicado de verdad.
  try {
    return json(await setPartnerActive(admin, params.id, body.active));
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Failed" }, 400);
  }
});
