"use client";

import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export type ToastVariant = "success" | "error" | "info";

export type ToastItem = { id: number; message: string; variant: ToastVariant };

export type ToastContextValue = {
  show: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

const DURATION = 4000; // ms visible before auto-dismiss

// App-wide toast provider. Mount once near the root; consume with useToast().
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = (idRef.current += 1);
    setToasts((list) => [...list, { id, message, variant }]);
  }, []);

  const value: ToastContextValue = {
    show,
    success: (m) => show(m, "success"),
    error: (m) => show(m, "error"),
    info: (m) => show(m, "info"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const VARIANT_STYLES: Record<ToastVariant, { ring: string; icon: string; iconBg: string }> = {
  success: { ring: "ring-emerald-500/15", icon: "text-emerald-600", iconBg: "bg-emerald-50" },
  error: { ring: "ring-red-500/15", icon: "text-red-600", iconBg: "bg-red-50" },
  info: { ring: "ring-brand/15", icon: "text-brand", iconBg: "bg-brand/5" },
};

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);
  const style = VARIANT_STYLES[toast.variant];

  useEffect(() => {
    // Enter, then schedule leave + unmount so the exit transition can play.
    const enter = setTimeout(() => setVisible(true), 10);
    const leave = setTimeout(() => setVisible(false), DURATION);
    const done = setTimeout(onDismiss, DURATION + 220);
    return () => {
      clearTimeout(enter);
      clearTimeout(leave);
      clearTimeout(done);
    };
  }, [onDismiss]);

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white px-4 py-3 shadow-[0_12px_40px_-12px_rgba(39,59,124,0.35)] ring-1 transition-all duration-200 ease-out ${style.ring} ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.iconBg} ${style.icon}`}>
        <ToastIcon variant={toast.variant} />
      </span>
      <p className="flex-1 text-sm font-medium text-zinc-800">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar"
        className="shrink-0 rounded-lg p-1 text-zinc-300 transition-colors hover:bg-zinc-100 hover:text-zinc-500"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

function ToastIcon({ variant }: { variant: ToastVariant }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (variant === "success") {
    return (
      <svg {...common}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }
  if (variant === "error") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="13" /><line x1="12" y1="16.5" x2="12" y2="16.5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" /><line x1="12" y1="11" x2="12" y2="16" /><line x1="12" y1="8" x2="12" y2="8" />
    </svg>
  );
}
