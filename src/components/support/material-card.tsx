import type { MaterialItem } from "@/lib/support-material";

const ICON = {
  doc: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  usecase: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
};

export function MaterialCard({ item }: { item: MaterialItem }) {
  const disabled = !item.url || item.url === "#";
  const cta = item.type === "usecase" ? "Ver caso" : "Abrir";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/8 text-brand">
        {ICON[item.type === "usecase" ? "usecase" : "doc"]}
      </span>
      <div className="flex flex-1 flex-col gap-1">
        <h3 className="text-sm font-semibold text-zinc-800">{item.title}</h3>
        {item.description && <p className="text-xs text-zinc-500">{item.description}</p>}
      </div>
      {disabled ? (
        <span className="text-xs font-medium text-zinc-300">Próximamente</span>
      ) : (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-brand hover:underline"
        >
          {cta}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17 17 7" /><path d="M7 7h10v10" />
          </svg>
        </a>
      )}
    </div>
  );
}
