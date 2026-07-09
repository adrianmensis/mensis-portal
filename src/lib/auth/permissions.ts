import type { Role } from "@/lib/types";

// The single source of truth for what each role may do. Pure predicates, so
// both the server guards and the UI read from the same rules.

// Mensis staff: sees every opportunity (its own included) and is the only role
// allowed to write the provisioning fields.
export function isAdminRole(role: Role) {
  return role === "admin";
}

// Runs the partner network: full CRUD on partner accounts.
export function canManagePartners(role: Role) {
  return role === "admin" || role === "partner_admin";
}

// Reads the network-wide pipeline rather than just its own opportunities.
// RLS narrows it further: a partner_admin never sees Mensis' own deals.
export function seesNetworkPipeline(role: Role) {
  return role === "admin" || role === "partner_admin";
}

// A partner_admin reads the whole network but writes only the opportunities it
// registered itself. Mirrors the `opp_update_own_or_admin` RLS policy.
export function canEditOpportunity(role: Role, viewerId: string, partnerId: string) {
  return isAdminRole(role) || partnerId === viewerId;
}
