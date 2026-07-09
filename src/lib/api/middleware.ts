import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canManagePartners, isAdminRole } from "@/lib/auth/permissions";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import type { Profile, Role } from "@/lib/types";

export type RouteCtx = { params?: Promise<Record<string, string>> };

export type AuthCtx = {
  supabase: SupabaseClient;
  request: Request;
  user: User;
  params: Record<string, string>;
};

export type AdminCtx = AuthCtx & {
  profile: Profile;
  admin: SupabaseClient;
};

export function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}

function wrap<T>(
  fn: (ctx: AuthCtx) => Promise<T>,
): (request: Request, routeCtx?: RouteCtx) => Promise<Response> {
  return async (request, routeCtx) => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return json({ error: "Unauthorized" }, 401);

      const params = routeCtx?.params ? await routeCtx.params : {};
      const result = await fn({ supabase, request, user, params });
      return result instanceof Response ? result : json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("API error:", message);
      return json({ error: message }, 500);
    }
  };
}

// Any authenticated user. RLS scopes the data automatically.
export function withAuth(handler: (ctx: AuthCtx) => Promise<unknown>) {
  return wrap(handler as (ctx: AuthCtx) => Promise<unknown>);
}

// Gates a handler on the caller's role and hands it a service-role client for
// privileged ops (auth user CRUD, Storage).
function withRole(allow: (role: Role) => boolean, handler: (ctx: AdminCtx) => Promise<unknown>) {
  return wrap(async (ctx) => {
    const { data } = await ctx.supabase
      .from("profiles")
      .select("*")
      .eq("id", ctx.user.id)
      .maybeSingle();
    const profile = data as Profile | null;
    if (!profile || !profile.active || !allow(profile.role)) {
      return json({ error: "Forbidden" }, 403);
    }
    return handler({ ...ctx, profile, admin: createAdminClient() });
  });
}

// Active admins only (Mensis staff): material library, tenant provisioning.
export function withAdmin(handler: (ctx: AdminCtx) => Promise<unknown>) {
  return withRole(isAdminRole, handler);
}

// The roles that run the partner network: admin and partner_admin.
export function withPartnerAdmin(handler: (ctx: AdminCtx) => Promise<unknown>) {
  return withRole(canManagePartners, handler);
}
