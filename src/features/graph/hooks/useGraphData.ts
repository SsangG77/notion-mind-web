"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GraphBatch, GraphData, GraphItem } from "@/types/graph";
import type { Plan } from "@/lib/billing";
import { assembleGraph, FREE_NODE_LIMIT, PRO_NODE_LIMIT } from "../lib/assembleGraph";
import { apiUrl } from "@/lib/apiUrl";
import { useLang } from "@/features/i18n/LangProvider";

interface State {
  data: GraphData | null;
  error: string | null;
  /** 아직 배치를 받는 중인지 */
  loading: boolean;
  /** 로드 세대 — 재동기화 시 증가 (그래프 초기화 신호) */
  gen: number;
  /** 마지막 동기화 완료 시각 (ms) */
  lastSync: number | null;
}

// 상한 + 초과 감지 여유 1페이지. 서버(/api/graph)도 같은 배치 수를 요금제로 검사
const maxBatches = (limit: number) => Math.ceil(limit / 100) + 1;

/** 커서 배치를 반복 수신하며 그래프를 점진 조립. reload()로 재동기화. 상한은 요금제에 따름 */
export function useGraphData(plan: Plan): State & { reload: () => void } {
  const lang = useLang();
  const limit = plan === "pro" ? PRO_NODE_LIMIT : FREE_NODE_LIMIT;
  const MAX_BATCHES = maxBatches(limit);
  const [state, setState] = useState<State>({
    data: null,
    error: null,
    loading: true,
    gen: 0,
    lastSync: null,
  });
  const runId = useRef(0);
  const genRef = useRef(0);

  const load = useCallback(async (gen: number) => {
    const id = ++runId.current;
    setState((s) => ({ ...s, data: null, error: null, loading: true, gen }));
    const items: GraphItem[] = [];
    let cursor: string | null = null;
    try {
      for (let i = 0; i < MAX_BATCHES; i++) {
        const url = apiUrl(
          cursor ? `/api/graph?cursor=${encodeURIComponent(cursor)}&i=${i}` : "/api/graph",
          lang,
        );
        const res = await fetch(url);
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error ?? `HTTP ${res.status}`);
        }
        const batch = (await res.json()) as GraphBatch;
        if (id !== runId.current) return; // 재동기화로 대체됨
        items.push(...batch.items);
        cursor = batch.nextCursor;
        const done = !cursor || i === MAX_BATCHES - 1;
        setState((s) => ({
          ...s,
          data: assembleGraph(items, !!cursor, limit),
          loading: !done,
          lastSync: done ? Date.now() : s.lastSync,
        }));
        if (!cursor) break;
      }
    } catch (e) {
      if (id === runId.current) {
        setState((s) => ({
          ...s,
          error: e instanceof Error ? e.message : String(e),
          loading: false,
        }));
      }
    }
  }, [limit, MAX_BATCHES, lang]);

  useEffect(() => {
    const ids = runId; // 언마운트 시 진행 중 로드 무효화
    load(0);
    return () => {
      ids.current++;
    };
  }, [load]);

  const reload = useCallback(() => {
    genRef.current++;
    load(genRef.current);
  }, [load]);

  return { ...state, reload };
}
