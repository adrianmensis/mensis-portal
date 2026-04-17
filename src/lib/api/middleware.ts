import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

type AuthHandler = (
  supabase: SupabaseClient,
  request: Request,
) => Promise<Response>;

export function withAuth(handler: AuthHandler) {
  return async (request: Request) => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      return await handler(supabase, request);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("API error:", message);
      return Response.json({ error: message }, { status: 500 });
    }
  };
}
