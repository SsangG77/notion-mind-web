"use client";

import { useEffect, useState } from "react";
import type { GraphData } from "@/types/graph";

interface State {
  data: GraphData | null;
  error: string | null;
  loading: boolean;
}

export function useGraphData(): State {
  const [state, setState] = useState<State>({ data: null, error: null, loading: true });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/graph")
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error ?? `HTTP ${res.status}`);
        }
        return res.json() as Promise<GraphData>;
      })
      .then((data) => !cancelled && setState({ data, error: null, loading: false }))
      .catch(
        (e: Error) => !cancelled && setState({ data: null, error: e.message, loading: false }),
      );
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
