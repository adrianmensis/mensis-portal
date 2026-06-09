import Link from "next/link";
import { requireProfile } from "@/lib/auth/profile";
import { OpportunityForm } from "@/components/opportunities/opportunity-form";

export const metadata = { title: "Register opportunity · Mensis" };

export default async function NewOpportunityPage() {
  await requireProfile();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <Link href="/app/opportunities" className="text-xs font-medium text-zinc-400 hover:text-zinc-600">
          ← Volver a prospectos
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
          Registrar prospecto
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Registra un nuevo prospecto. Nuestro equipo lo revisará y actualizará su estado.
        </p>
      </div>
      <OpportunityForm />
    </div>
  );
}
