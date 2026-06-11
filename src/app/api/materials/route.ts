import { withAuth, withAdmin, json } from "@/lib/api/middleware";
import { listMaterials, createMaterial } from "@/lib/services/materials";

export const GET = withAuth(async ({ supabase }) => {
  return listMaterials(supabase);
});

export const POST = withAdmin(async ({ admin, user, request }) => {
  const form = await request.formData().catch(() => null);
  if (!form) return json({ error: "Invalid form data." }, 400);

  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const file = form.get("file");

  if (!title) return json({ error: "El título es obligatorio." }, 400);
  if (!(file instanceof File) || file.size === 0) {
    return json({ error: "Selecciona un archivo." }, 400);
  }

  const material = await createMaterial(admin, {
    title,
    description,
    file,
    uploaded_by: user.id,
  });
  return json(material, 201);
});
