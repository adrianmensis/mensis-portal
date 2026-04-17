import { withAuth } from "@/lib/api/middleware";

export const GET = withAuth(async (supabase) => {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
});

export const POST = withAuth(async (supabase, request) => {
  const { data: { user } } = await supabase.auth.getUser();
  const body = await request.json();
  const { data, error } = await supabase
    .from("leads")
    .insert({ ...body, created_by: user!.id })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
});
