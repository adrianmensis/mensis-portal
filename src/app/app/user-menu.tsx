"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { logout } from "../login/actions";

export function UserMenu({
  email,
  fullName,
  collapsed,
}: {
  email: string | null;
  fullName: string | null;
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const displayName =
    fullName ??
    email?.split("@")[0]?.replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ??
    "Usuario";

  return (
    <div ref={ref} className="relative">
      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-2 min-w-[200px] overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-[0_12px_32px_-8px_rgba(39,59,124,0.25)]">
          <Link
            href="/app/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Mi perfil
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar sesión
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/70 ${
          open ? "bg-white/70" : ""
        } ${collapsed ? "justify-center" : ""}`}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
          {email ? email[0].toUpperCase() : "?"}
        </span>
        {!collapsed && (
          <>
            <span className="flex min-w-0 flex-1 flex-col text-left">
              <span className="truncate text-[13px] font-medium text-zinc-700">{displayName}</span>
              <span className="truncate text-[11px] text-zinc-400">{email ?? ""}</span>
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}>
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
}
