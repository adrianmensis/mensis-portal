"use client";

import { useState, useTransition } from "react";
import { api } from "@/lib/api/client";
import { Switch } from "@/components/ui/toggle";

// Interactive Active/Inactive switch for a partner. Optimistic: flips
// immediately, reverts on error.
export function PartnerStatusToggle({
  partnerId,
  active,
}: {
  partnerId: string;
  active: boolean;
}) {
  const [val, setVal] = useState(active);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !val;
    setVal(next);
    startTransition(async () => {
      try {
        await api.partners.setActive(partnerId, next);
      } catch {
        setVal(!next);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Switch checked={val} onChange={toggle} disabled={pending} label="Toggle active" />
      <span className={`text-xs font-medium ${val ? "text-emerald-600" : "text-zinc-400"}`}>
        {val ? "Activo" : "Inactivo"}
      </span>
    </div>
  );
}
