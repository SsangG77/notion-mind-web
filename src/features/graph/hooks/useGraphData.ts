"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GraphBatch, GraphData, GraphItem } from "@/types/graph";
import { assembleGraph, FREE_NODE_LIMIT } from "../lib/assembleGraph";

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

const MAX_BATCHES = Math.ceil(FREE_NODE_LIMIT / 100) + 1; // 상한 + 초과 감지 여유 1페이지

/** 커서 배치를 반복 수신하며 그래프를 점진 조립. reload()로 재동기화 */
export function useGraphData(): State & { reload: () => void } {
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
        const url = cursor ? `/api/graph?cursor=${encodeURIComponent(cursor)}` : "/api/graph";
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
          data: assembleGraph(items, !!cursor),
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
  }, []);

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
