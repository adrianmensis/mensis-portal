"use client";

import { useState, useTransition } from "react";

// Tiny mutation hook over the API client. The write-side counterpart of
// useResource: wraps the call in a transition and surfaces pending + error
// state so components don't inline their own try/catch around fetch.
export function useMutation<TInput, TResult>(
  fn: (input: TInput) => Promise<TResult>,
  {
    onSuccess,
    fallbackError = "Algo salió mal.",
  }: {
    onSuccess?: (result: TResult) => void;
    fallbackError?: string;
  } = {},
) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function mutate(input: TInput) {
    startTransition(async () => {
      try {
        const result = await fn(input);
        setError(null);
        onSuccess?.(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : fallbackError);
      }
    });
  }

  return { mutate, pending, error };
}
