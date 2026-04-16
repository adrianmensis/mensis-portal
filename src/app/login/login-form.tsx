"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    undefined,
  );

  return (
    <form action={action} className="flex w-full flex-col gap-4">
      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </Field>

      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
