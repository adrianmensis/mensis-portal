export type Role = "admin" | "partner";

export type Profile = {
  id: string;
  role: Role;
  full_name: string | null;
  country: string | null;
  email: string | null;
  phone: string | null;
  referred_by: string | null;
  entry_date: string | null;
  process_stage: string | null;
  linkedin_url: string | null;
  active: boolean;
  created_at: string;
};

// Stages of the partner onboarding process. Adjust to match your real flow.
export const PARTNER_STAGES = [
  "Prospecto",
  "Entrevista",
  "Onboarding",
  "Activo",
  "Inactivo",
] as const;

export type OpportunityStatus = "pending" | "approved" | "won" | "lost";

export type Opportunity = {
  id: string;
  partner_id: string;
  client_name: string;
  website: string | null;
  collaborators: number | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  country: string | null;
  estimated_avatars: number | null;
  estimated_value: number | null;
  notes: string | null;
  status: OpportunityStatus;
  created_at: string;
  updated_at: string;
};

export const STATUS_LABELS: Record<OpportunityStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  won: "Won",
  lost: "Lost",
};

export const STATUS_STYLES: Record<OpportunityStatus, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  approved: "bg-blue-50 text-blue-700 ring-blue-600/20",
  won: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  lost: "bg-zinc-100 text-zinc-500 ring-zinc-400/20",
};
