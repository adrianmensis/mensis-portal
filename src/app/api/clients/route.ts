import { withAuth } from "@/lib/api/middleware";

export const GET = withAuth(async (supabase) => {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
});

export const POST = withAuth(async (supabase, request) => {
  const body = await request.json();
  const { data, error } = await supabase
    .from("clients")
    .insert(body)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
});
