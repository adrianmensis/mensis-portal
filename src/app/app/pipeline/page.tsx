import { requireAdmin } from "@/lib/auth/profile";
import { PipelineManager } from "@/components/pipeline/pipeline-manager";

export const metadata = { title: "Pipeline · Mensis Partner Portal" };

export default async function PipelinePage() {
  await requireAdmin();
  return <PipelineManager />;
}
