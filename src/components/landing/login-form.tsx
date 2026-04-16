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
      className="flex w-full max-w-xs flex-col gap-4 text-left"
    >
      <input
        name="email"
        type="email"
        placeholder="Email"
        autoComplete="email"
        required
        className="border-0 border-b border-white/20 bg-transparent px-1 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/70 focus:outline-none focus:ring-0"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        required
        className="border-0 border-b border-white/20 bg-transparent px-1 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/70 focus:outline-none focus:ring-0"
      />
      {state?.error && (
        <p className="text-center text-xs text-rose-300/80">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex h-10 items-center justify-center rounded-full border border-white/30 bg-white/5 px-6 text-sm font-medium text-white/90 shadow-[0_0_40px_rgba(99,102,241,0.15)] backdrop-blur transition-colors hover:border-white/60 hover:bg-white/10 hover:text-white disabled:opacity-60"
      >
        {pending ? "Entering…" : "Enter"}
      </button>
    </form>
  );
}
