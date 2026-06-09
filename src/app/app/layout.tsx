import { requireProfile } from "@/lib/auth/profile";
import { Sidebar } from "./sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();

  return (
    <div className="flex min-h-screen bg-[#fafbfd]">
      <Sidebar role={profile.role} email={profile.email} fullName={profile.full_name} />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
