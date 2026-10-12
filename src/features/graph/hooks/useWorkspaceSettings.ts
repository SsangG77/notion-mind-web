"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type Graph from "graphology";
import type { Plan } from "@/lib/billing";
import { EMPTY_SETTINGS, type WorkspaceSettings } from "@/lib/billing";
import { apiUrl } from "@/lib/apiUrl";

/**
 * Pro 영구 설정(숨김, 핀, 자동 동기화). 로드 시 한 번 받아 LayoutManager 가 노드 추가할 때 적용하고,
 * 조작 때마다 그래프에서 읽어 디바운스 저장. Free 는 아무것도 안 함(세션 한정).
 */
export function useWorkspaceSettings(plan: Plan) {
  const [saved, setSaved] = useState<WorkspaceSettings | null>(plan === "pro" ? null : EMPTY_SETTINGS);
  const [autoSync, setAutoSyncState] = useState(false);
  const autoSyncRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // persist 가 저장할 때 최신 값을 보도록 담아 둔다(렌더 중 ref 쓰기 금지)
  useEffect(() => {
    autoSyncRef.current = autoSync;
  }, [autoSync]);

  useEffect(() => {
    if (plan !== "pro") return;
    let alive = true;
    fetch(apiUrl("/api/settings"))
      .then((r) => r.json())
      .then((s: WorkspaceSettings) => {
        if (!alive) return;
        setSaved(s);
        setAutoSyncState(s.autoSync);
      })
      .catch(() => alive && setSaved(EMPTY_SETTINGS));
    return () => {
      alive = false;
    };
  }, [plan]);

  // 그래프 현재 상태 → 서버. 연속 조작은 800ms 로 묶음
  const persist = useCallback(
    (graph: Graph) => {
      if (plan !== "pro") return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const next: WorkspaceSettings = { hidden: [], pinned: {}, autoSync: autoSyncRef.current };
        graph.forEachNode((id, a) => {
          if (a.hidden) next.hidden.push(id);
          if (a.pinned) next.pinned[id] = { x: a.x as number, y: a.y as number };
        });
        fetch(apiUrl("/api/settings"), {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(next),
        }).catch(() => {});
      }, 800);
    },
    [plan],
  );

  // 자동 동기화 토글 — 그래프를 건드리지 않으므로 숨김/핀은 서버에 있던 값을 그대로 돌려보낸다
  const setAutoSync = useCallback(
    (on: boolean) => {
      if (plan !== "pro") return;
      setAutoSyncState(on);
      fetch(apiUrl("/api/settings"), {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...(saved ?? EMPTY_SETTINGS), autoSync: on }),
      }).catch(() => {});
    },
    [plan, saved],
  );

  return { saved, persist, autoSync, setAutoSync };
}
