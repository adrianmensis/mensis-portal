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
      className="flex w-full max-w-xl flex-col gap-5 text-left"
    >
      <input
        name="email"
        type="email"
        placeholder="Email"
        autoComplete="email"
        required
        className="border-0 border-b border-brand-light bg-transparent px-1 py-3 text-base text-brand placeholder:text-brand/40 focus:border-brand focus:outline-none focus:ring-0"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        required
        className="border-0 border-b border-brand-light bg-transparent px-1 py-3 text-base text-brand placeholder:text-brand/40 focus:border-brand focus:outline-none focus:ring-0"
      />
      {state?.error && (
        <p className="text-center text-xs text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-3 inline-flex h-14 w-full items-center justify-center rounded-lg bg-brand px-6 text-base font-medium text-white shadow-[0_10px_30px_-8px_rgba(39,59,124,0.45)] transition-colors hover:bg-brand/90 disabled:opacity-60"
      >
        {pending ? "Logging in…" : "Login"}
      </button>
    </form>
  );
}
