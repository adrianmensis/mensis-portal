import type { ReactNode } from "react";

export function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-zinc-200 bg-white p-12 text-center">
      <p className="text-sm text-zinc-400">{message}</p>
      {action}
    </div>
  );
}
