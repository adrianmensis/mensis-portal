import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [contactsRes, clientsRes, goalsRes] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("avatar_count, price_per_avatar, user_count"),
    supabase
      .from("goals")
      .select("current_avatars, target_avatars, month")
      .order("month", { ascending: false })
      .limit(1),
  ]);

  const totalContacts = contactsRes.count ?? 0;
  const clients = clientsRes.data ?? [];

  const totalAvatars = clients.reduce((s, c) => s + c.avatar_count, 0);
  const mrr = clients.reduce((s, c) => s + c.avatar_count * c.price_per_avatar, 0);
  const growthUnits = clients.reduce((s, c) => s + Math.max(0, c.user_count - c.avatar_count), 0);
  const growthRevenue = clients.reduce(
    (s, c) => s + Math.max(0, c.user_count - c.avatar_count) * c.price_per_avatar,
    0,
  );

  const annualGoal = goalsRes.data?.[0];
  const targetAvatars = annualGoal?.target_avatars ?? 0;
  const avgPrice =
    clients.length > 0
      ? clients.reduce((s, c) => s + c.price_per_avatar, 0) / clients.length
      : 0;
  const targetRevenue = targetAvatars * avgPrice;

  return Response.json({
    totalContacts,
    totalAvatars,
    mrr,
    growthUnits,
    growthRevenue,
    targetAvatars,
    targetRevenue,
    avgPrice,
    clientCount: clients.length,
  });
}
