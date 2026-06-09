"use client";

import { useActionState, useState } from "react";
import { login, type LoginState } from "@/app/login/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    undefined,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-[13px] font-medium text-zinc-600"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          required
          className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50/60 px-3.5 text-sm text-zinc-800 transition-all placeholder:text-zinc-400 focus:border-brand/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand/5"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-[13px] font-medium text-zinc-600"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••"
            autoComplete="current-password"
            required
            className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50/60 px-3.5 pr-11 text-sm text-zinc-800 transition-all placeholder:text-zinc-400 focus:border-brand/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand/5"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600"
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <a
        href="mailto:hello@mensismentor.com?subject=Partner%20Portal%20access"
        className="-mt-2 text-[13px] font-medium text-brand transition-colors hover:text-brand/80"
      >
        Forgot password?
      </a>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs text-red-500">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-lg bg-brand text-sm font-semibold text-white shadow-[0_4px_20px_-4px_rgba(39,59,124,0.45)] transition-all hover:bg-brand/90 hover:shadow-[0_6px_24px_-4px_rgba(39,59,124,0.55)] disabled:opacity-50"
      >
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
