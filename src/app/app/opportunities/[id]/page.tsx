import { requireProfile } from "@/lib/auth/profile";
import { OpportunityDetail } from "@/components/opportunities/opportunity-detail";

export const metadata = { title: "Oportunidad · Mensis Partner Portal" };

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireProfile();
  const { id } = await params;
  return <OpportunityDetail id={id} role={profile.role} viewerId={profile.id} />;
}
