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
      className="flex w-full max-w-xs flex-col gap-3 text-left"
    >
      <input
        name="email"
        type="email"
        placeholder="Email"
        autoComplete="email"
        required
        className="h-11 w-full rounded-md border border-brand-light/70 bg-white px-4 text-sm text-brand placeholder:text-zinc-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        required
        className="h-11 w-full rounded-md border border-brand-light/70 bg-white px-4 text-sm text-brand placeholder:text-zinc-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
      />
      {state?.error && (
        <p className="text-center text-xs text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex h-11 items-center justify-center rounded-md bg-brand px-6 text-sm font-medium text-white shadow-[0_8px_24px_-6px_rgba(39,59,124,0.4)] transition-colors hover:bg-brand/90 disabled:opacity-60"
      >
        {pending ? "Entering…" : "Enter"}
      </button>
    </form>
  );
}
