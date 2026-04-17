import { withAuth } from "@/lib/api/middleware";

export const GET = withAuth(async (supabase, request) => {
  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("lead_id");

  let query = supabase.from("follow_ups").select("*").order("created_at", { ascending: false });
  if (leadId) query = query.eq("lead_id", leadId);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
});

export const POST = withAuth(async (supabase, request) => {
  const { data: { user } } = await supabase.auth.getUser();
  const body = await request.json();
  const { data, error } = await supabase
    .from("follow_ups")
    .insert({ ...body, created_by: user!.id })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
});

export const PATCH = withAuth(async (supabase, request) => {
  const body = await request.json();
  const { id, ...updates } = body;
  const { data, error } = await supabase
    .from("follow_ups")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
});
