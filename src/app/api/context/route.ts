import { withAuth } from "@/lib/api/middleware";

export const GET = withAuth(async (supabase) => {
  const { data } = await supabase
    .from("context")
    .select("*")
    .limit(1)
    .single();

  return Response.json(data ?? { content: "" });
});

export const PUT = withAuth(async (supabase, request) => {
  const { content } = await request.json();

  const { data: existing } = await supabase
    .from("context")
    .select("id")
    .limit(1)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from("context")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json(data);
  }

  const { data, error } = await supabase
    .from("context")
    .insert({ content })
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
});
