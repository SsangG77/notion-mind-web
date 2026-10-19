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
export function useGraphData(
  plan: Plan,
  /** 미리 담긴 항목 — 주면 서버를 부르지 않는다(로그인 없는 예시 화면용) */
  preset?: GraphItem[],
): State & { reload: () => void } {
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
    if (preset) {
      // 예시 데이터는 받아올 것이 없지만 바로 꽂으면 안 된다 — sigma 가 노드 프로그램을 등록하기 전에
      // 노드가 들어가 "could not find a suitable program for node type" 로 캔버스가 안 그려진다.
      // 서버에서 받아올 때와 같은 타이밍이 되도록 한 틱 뒤로 미룬다.
      await new Promise((r) => setTimeout(r, 400));
      setState({
        data: assembleGraph(preset, false, limit),
        error: null,
        loading: false,
        gen,
        lastSync: Date.now(),
      });
      return;
    }
    const id = ++runId.current;
    setState((s) => ({ ...s, data: null, error: null, loading: true, gen }));
    const items: GraphItem[] = [];
    let cursor: string | null = null;
    try {
      for (let i = 0; i < MAX_BATCHES; i++) {
        // 배치 번호는 보내지 않는다 — 서버가 커서 안에 봉인해 직접 센다
        const url = apiUrl(
          cursor ? `/api/graph?cursor=${encodeURIComponent(cursor)}` : "/api/graph",
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
  }, [limit, MAX_BATCHES, lang, preset]);

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
