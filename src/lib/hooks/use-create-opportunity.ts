"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { useMutation } from "@/lib/hooks/use-mutation";
import type { CreateOpportunityInput } from "@/lib/services/opportunities";

// Encapsulates the "create opportunity" mutation: the API call, the redirect
// fallback and the error copy live here instead of inside the form component.
export function useCreateOpportunity({ onSuccess }: { onSuccess?: () => void } = {}) {
  const router = useRouter();

  return useMutation<CreateOpportunityInput, unknown>(
    (input) => api.opportunities.create(input),
    {
      onSuccess: () => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/app/opportunities");
          router.refresh();
        }
      },
      fallbackError: "No se pudo registrar.",
    },
  );
}
