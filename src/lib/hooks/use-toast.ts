"use client";

import { useContext } from "react";
import { ToastContext } from "@/components/ui/toast";

// Access the app-wide toast API: toast.success("…"), toast.error("…"), etc.
// Must be used under a <ToastProvider> (mounted in the root layout).
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a <ToastProvider>");
  return ctx;
}
