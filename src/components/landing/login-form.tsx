"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/login/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    undefined,
  );

  return (
    <form
      action={action}
      className="flex w-full max-w-sm flex-col gap-3"
    >
      <input
        name="email"
        type="email"
        placeholder="Email"
        autoComplete="email"
        required
        className="h-12 w-full rounded-lg border border-zinc-200/80 bg-white px-4 text-sm text-zinc-800 shadow-sm placeholder:text-zinc-400 transition-all focus:border-brand/30 focus:outline-none focus:ring-4 focus:ring-brand/5"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        required
        className="h-12 w-full rounded-lg border border-zinc-200/80 bg-white px-4 text-sm text-zinc-800 shadow-sm placeholder:text-zinc-400 transition-all focus:border-brand/30 focus:outline-none focus:ring-4 focus:ring-brand/5"
      />
      {state?.error && (
        <p className="text-center text-xs text-red-500">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 h-12 w-full rounded-lg bg-brand text-sm font-medium text-white shadow-[0_4px_20px_-4px_rgba(39,59,124,0.4)] transition-all hover:bg-brand/90 hover:shadow-[0_6px_24px_-4px_rgba(39,59,124,0.5)] disabled:opacity-50"
      >
        {pending ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
