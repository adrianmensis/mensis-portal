"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/login/actions";
import { PasswordInput } from "@/components/ui/password-input";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    undefined,
  );

  return (
    <form action={action} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-[13px] font-medium text-zinc-600"
        >
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="tu@empresa.com"
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
          Contraseña
        </label>
        <PasswordInput
          id="password"
          name="password"
          placeholder="••••••••••"
          autoComplete="current-password"
          required
        />
      </div>

      <p className="-mt-2 text-center text-[13px] text-zinc-500">
        Si olvidó su contraseña, contacte a su ejecutivo de Mensis.
      </p>

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
        {pending ? "Iniciando sesión…" : "Iniciar sesión"}
      </button>
    </form>
  );
}
