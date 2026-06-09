export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin text-brand ${className}`.trim()}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function LoadingRow({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white p-10 text-sm text-zinc-400">
      <Spinner className="h-4 w-4" />
      {label}
    </div>
  );
}
