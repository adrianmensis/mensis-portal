"use client";

import { useCallback, useEffect, useState } from "react";

// Tiny data-loading hook over the API client. Returns the data, loading and
// error state, plus a `reload` to refetch after a mutation.
export function useResource<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetcher()
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
    // fetcher is expected to be stable (defined inline per render is fine
    // because we only call load() explicitly / on mount).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
