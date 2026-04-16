"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/login/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    undefined,
  );

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white/80 p-8 shadow-sm backdrop-blur">
      <form
        action={action}
        className="flex flex-col gap-4"
      >
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          required
          className="h-[52px] w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 text-[15px] text-zinc-800 placeholder:text-zinc-400 focus:border-brand/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/10"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          required
          className="h-[52px] w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 text-[15px] text-zinc-800 placeholder:text-zinc-400 focus:border-brand/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/10"
        />
        {state?.error && (
          <p className="text-center text-xs text-red-600">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="h-[52px] w-full rounded-xl bg-brand text-[15px] font-medium text-white transition-colors hover:bg-brand/90 disabled:opacity-60"
        >
          {pending ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
