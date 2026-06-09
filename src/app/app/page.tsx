import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/profile";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata = { title: "Dashboard · Mensis Partner Portal" };

export default async function DashboardPage() {
  const profile = await requireProfile();
  // Partners don't have a network dashboard — send them to their own view.
  if (profile.role === "partner") redirect("/app/opportunities");
  return <DashboardView role={profile.role} fullName={profile.full_name} />;
}
