"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type Graph from "graphology";
import type { Plan } from "@/lib/billing";
import { EMPTY_SETTINGS, type WorkspaceSettings } from "@/lib/billing";
import { withDev } from "@/lib/devParam";

/**
 * Pro 영구 설정(숨김·핀). 로드 시 한 번 받아 LayoutManager 가 노드 추가할 때 적용하고,
 * 조작 때마다 그래프에서 읽어 디바운스 저장. Free 는 아무것도 안 함(세션 한정).
 */
export function useWorkspaceSettings(plan: Plan) {
  const [saved, setSaved] = useState<WorkspaceSettings | null>(plan === "pro" ? null : EMPTY_SETTINGS);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (plan !== "pro") return;
    let alive = true;
    fetch(withDev("/api/settings"))
      .then((r) => r.json())
      .then((s: WorkspaceSettings) => alive && setSaved(s))
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
        const next: WorkspaceSettings = { hidden: [], pinned: {} };
        graph.forEachNode((id, a) => {
          if (a.hidden) next.hidden.push(id);
          if (a.pinned) next.pinned[id] = { x: a.x as number, y: a.y as number };
        });
        fetch(withDev("/api/settings"), {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(next),
        }).catch(() => {});
      }, 800);
    },
    [plan],
  );

  return { saved, persist };
}
