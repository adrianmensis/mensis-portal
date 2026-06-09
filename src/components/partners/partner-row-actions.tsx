"use client";

import { useState, useTransition } from "react";
import { api } from "@/lib/api/client";

export function PartnerRowActions({ partnerId }: { partnerId: string }) {
  const [pending, startTransition] = useTransition();
  const [newPassword, setNewPassword] = useState<string | null>(null);

  function reset() {
    startTransition(async () => {
      const res = await api.partners.resetPassword(partnerId);
      setNewPassword(res.password);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        onClick={reset}
        disabled={pending}
        className="rounded-md px-2.5 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/8 disabled:opacity-50"
      >
        Reset password
      </button>
      {newPassword && (
        <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-[11px] text-emerald-800">
          New password: {newPassword}
        </span>
      )}
    </div>
  );
}
