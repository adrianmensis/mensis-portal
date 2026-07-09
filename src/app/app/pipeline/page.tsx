import { requirePartnerAdmin } from "@/lib/auth/profile";
import { PipelineManager } from "@/components/pipeline/pipeline-manager";

export const metadata = { title: "Pipeline · Mensis Partner Portal" };

export default async function PipelinePage() {
  const profile = await requirePartnerAdmin();
  return <PipelineManager role={profile.role} viewerId={profile.id} />;
}
