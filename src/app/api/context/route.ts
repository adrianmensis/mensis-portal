import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabase
    .from("context")
    .select("*")
    .limit(1)
    .single();

  return Response.json(data ?? { content: "" });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

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
}
