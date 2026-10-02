"use client";

import { useEffect, useState } from "react";
import type { NodeDetail, NodeType } from "@/types/graph";
import { apiUrl } from "@/lib/apiUrl";
import { useLang } from "@/features/i18n/LangProvider";

interface State {
  detail: NodeDetail | null;
  error: string | null;
  loading: boolean;
}

/** 선택된 노드의 상세를 불러옴 — 선택이 바뀌면 이전 요청은 버림 */
export function useNodeDetail(id: string | null, kind: NodeType): State {
  const lang = useLang();
  const [state, setState] = useState<State>({ detail: null, error: null, loading: false });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    // 새 선택 — 이전 상세를 즉시 비우고 로딩 표시
    const reset = setTimeout(() => setState({ detail: null, error: null, loading: true }), 0);
    fetch(apiUrl(`/api/node/${id}?kind=${kind}`, lang))
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error ?? `HTTP ${res.status}`);
        }
        return res.json() as Promise<NodeDetail>;
      })
      .then((detail) => !cancelled && setState({ detail, error: null, loading: false }))
      .catch(
        (e: Error) => !cancelled && setState({ detail: null, error: e.message, loading: false }),
      );
    return () => {
      cancelled = true;
      clearTimeout(reset);
    };
  }, [id, kind, lang]);

  return state;
}
