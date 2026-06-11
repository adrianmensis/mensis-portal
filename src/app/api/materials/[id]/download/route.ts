import { createAdminClient } from "@/lib/supabase/admin";
import { withAuth, json } from "@/lib/api/middleware";
import { signedDownloadUrl } from "@/lib/services/materials";

// Any authenticated user can download. The materials RLS already gates the
// listing; we mint a short-lived signed URL with the service role and redirect.
export const GET = withAuth(async ({ params }) => {
  const url = await signedDownloadUrl(createAdminClient(), params.id);
  if (!url) return json({ error: "Not found" }, 404);
  return Response.redirect(url, 302);
});
