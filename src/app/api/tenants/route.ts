import { withAuth } from "@/lib/api/middleware";

export const GET = withAuth(async (supabase) => {
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
});

export const POST = withAuth(async (supabase, request) => {
  const { data: { user } } = await supabase.auth.getUser();
  const body = await request.json();
  const { data, error } = await supabase
    .from("tenants")
    .insert({ ...body, requested_by: user!.email })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
});

export const PATCH = withAuth(async (supabase, request) => {
  const { id, ...updates } = await request.json();

  if (updates.status === "completed" && !updates.completed_at) {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("tenants")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
});
