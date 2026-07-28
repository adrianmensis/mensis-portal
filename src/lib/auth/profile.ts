import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canManagePartners } from "@/lib/auth/permissions";
import type { Profile } from "@/lib/types";

// Returns the signed-in user's profile, or null if not authenticated /
// no profile row exists.
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (data as Profile) ?? null;
}

// Guarantees a signed-in *active* profile; redirects to login otherwise.
//
// Desactivar un partner lo banea en auth, pero eso solo impide iniciar sesión:
// una sesión ya abierta seguía funcionando hasta que venciera el token, así que
// el cambio "no se aplicaba". La bandera se revisa en cada render del portal.
export async function requireProfile(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/");
  if (!profile.active) redirect("/?inactivo=1");
  return profile;
}

// Guarantees the signed-in user is an active admin; otherwise sends them
// back to the app home (where partners land).
export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "admin" || !profile.active) redirect("/app");
  return profile;
}

// Guarantees the signed-in user runs the partner network — an active admin or
// partner_admin. Gates the Partners tab and the network-wide pipeline.
export async function requirePartnerAdmin(): Promise<Profile> {
  const profile = await requireProfile();
  if (!profile.active || !canManagePartners(profile.role)) redirect("/app");
  return profile;
}
