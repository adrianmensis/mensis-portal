"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { logout } from "../login/actions";
import type { Role } from "@/lib/types";

type NavItem = { label: string; href: string; icon: React.ReactNode };

const ICONS = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  pipeline: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  partners: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  opportunities: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  resources: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  quotes: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="10" y2="10" /><line x1="14" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="10" y2="14" /><line x1="14" y1="14" x2="16" y2="14" />
      <line x1="8" y1="18" x2="10" y2="18" /><line x1="14" y1="18" x2="16" y2="18" />
    </svg>
  ),
  academy: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10 12 5 2 10l10 5 10-5z" /><path d="M6 12v5c0 1 2.5 2.5 6 2.5s6-1.5 6-2.5v-5" />
    </svg>
  ),
};

const NAV: Record<Role, NavItem[]> = {
  admin: [
    { label: "Dashboard", href: "/app", icon: ICONS.dashboard },
    { label: "Oportunidades", href: "/app/pipeline", icon: ICONS.pipeline },
    { label: "Partners", href: "/app/partners", icon: ICONS.partners },
    { label: "Cotizadores", href: "/app/quotes", icon: ICONS.quotes },
    { label: "Material de apoyo", href: "/app/resources", icon: ICONS.academy },
  ],
  partner: [
    { label: "Oportunidades", href: "/app/opportunities", icon: ICONS.opportunities },
    { label: "Cotizadores", href: "/app/quotes", icon: ICONS.quotes },
    { label: "Material de apoyo", href: "/app/resources", icon: ICONS.academy },
  ],
};

export function Sidebar({
  role,
  email,
  fullName,
}: {
  role: Role;
  email: string | null;
  fullName: string | null;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("sidebar-collapsed") === "true") setCollapsed(true);
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      localStorage.setItem("sidebar-collapsed", String(!prev));
      return !prev;
    });
  }

  const items = NAV[role];
  const displayName =
    fullName ??
    email?.split("@")[0]?.replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ??
    "User";

  return (
    <div className="relative">
      <aside
        className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-zinc-200/80 bg-white transition-all duration-200 ${
          collapsed ? "w-[68px]" : "w-[240px]"
        }`}
      >
        <div className="flex items-center justify-center py-6">
          <Link href="/app">
            {collapsed ? (
              <Image src="/isotipo.png" alt="Mensis" width={34} height={34} className="rounded-lg" />
            ) : (
              <Image src="/logo.png" alt="Mensis" width={130} height={36} className="h-9 w-auto" />
            )}
          </Link>
        </div>

        {!collapsed && (
          <div className="px-4 pb-2">
            <span className="inline-flex items-center rounded-full bg-brand/8 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand">
              {role === "admin" ? "Admin" : "Partner"}
            </span>
          </div>
        )}

        <nav className="flex flex-1 flex-col gap-0.5 px-3 pt-2">
          {items.map((item) => {
            const isActive =
              item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
            return (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-[14px] font-medium transition-all ${
                    collapsed ? "justify-center" : ""
                  } ${
                    isActive
                      ? "bg-brand/8 text-brand"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                  }`}
                >
                  <span className={`shrink-0 ${isActive ? "text-brand" : "text-zinc-400"}`}>
                    {item.icon}
                  </span>
                  {!collapsed && item.label}
                </Link>
                {collapsed && (
                  <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex flex-col gap-1 border-t border-zinc-100 px-3 py-4">
          <Link
            href="/app/profile"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
              pathname.startsWith("/app/profile") ? "bg-brand/8" : "hover:bg-zinc-50"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
              {email ? email[0].toUpperCase() : "?"}
            </span>
            {!collapsed && (
              <span className="flex min-w-0 flex-col text-left">
                <span className="truncate text-[13px] font-medium text-zinc-700">{displayName}</span>
                <span className="truncate text-[11px] text-zinc-400">{email ?? ""}</span>
              </span>
            )}
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-700 ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {!collapsed && "Cerrar sesión"}
            </button>
          </form>
        </div>
      </aside>

      <button
        onClick={toggle}
        className="absolute -right-3.5 top-1/2 z-40 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm transition-colors hover:bg-zinc-50"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-zinc-500 transition-transform ${collapsed ? "rotate-180" : ""}`}>
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
    </div>
  );
}
