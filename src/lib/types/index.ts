export type LeadCategory = "partner" | "cliente_final";
export type LeadStatus = "new" | "contacted" | "responded" | "qualified" | "proposal" | "won" | "lost";
export type TenantStatus = "requested" | "in_progress" | "completed";
export type ObjectiveCategory = "sales" | "product" | "fundraising";
export type ObjectiveStatus = "not_started" | "in_progress" | "completed";
export type FollowUpType = "note" | "call" | "email" | "meeting" | "task";

export type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  category: LeadCategory;
  status: LeadStatus;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Client = {
  id: string;
  name: string;
  description: string | null;
  employee_count: number;
  user_count: number;
  avatar_count: number;
  price_per_avatar: number;
  country: string | null;
  tenant_url: string | null;
  contact_first_name: string | null;
  contact_last_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
};

export type Trial = {
  id: string;
  name: string;
  description: string | null;
  employee_count: number;
  user_count: number;
  avatar_count: number;
  country: string | null;
  tenant_url: string | null;
  contact_first_name: string | null;
  contact_last_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
};

export type Tenant = {
  id: string;
  name: string;
  description: string | null;
  acquired_licenses: number;
  calendar_platform: string | null;
  website: string | null;
  meeting_platform: string | null;
  country: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  employee_count: number;
  max_mentor_sessions: number;
  max_user_sessions: number;
  pricing_by_user: number;
  starknet_wallet: string | null;
  tenant_id: string | null;
  tenant_url: string | null;
  status: TenantStatus;
  requested_by: string | null;
  requested_at: string;
  completed_at: string | null;
  created_at: string;
};

export type FollowUp = {
  id: string;
  lead_id: string;
  type: FollowUpType;
  content: string;
  due_date: string | null;
  done: boolean;
  created_at: string;
};

export type Objective = {
  id: string;
  name: string;
  description: string | null;
  category: ObjectiveCategory;
  status: ObjectiveStatus;
  target_date: string | null;
  progress: number;
  sort_order: number;
  created_at: string;
};
