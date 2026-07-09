import { requirePartnerAdmin } from "@/lib/auth/profile";
import { PartnerDetail } from "@/components/partners/partner-detail";

export const metadata = { title: "Partner · Mensis Partner Portal" };

export default async function PartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePartnerAdmin();
  const { id } = await params;
  return <PartnerDetail id={id} />;
}
