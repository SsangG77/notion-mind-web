"use client";

import { useEffect, useRef } from "react";
import type { Plan } from "@/lib/billing";

/** 자동 동기화 주기. 노션 search API 가 새 페이지를 반영하는 데 몇 초 걸리므로 짧게 둘 이유가 없다 */
export const AUTO_SYNC_MS = 5 * 60 * 1000;

/**
 * Pro 자동 동기화 — 켜져 있으면 주기적으로 그래프를 다시 읽는다.
 *
 * ⚠️ rAF 금지. Safari 는 창이 가려지면 rAF 를 통째로 멈춰 타이머가 서 버린다(물리 루프와 같은 이유).
 * setTimeout 체인으로 돌리고, 탭이 숨겨진 동안에는 건너뛴 뒤 돌아올 때 한 번 당겨 받는다.
 */
export function useAutoSync(plan: Plan, enabled: boolean, reload: () => void) {
  const reloadRef = useRef(reload);
  const missed = useRef(false);

  // 최신 reload 를 effect 안에서 담아 둔다(렌더 중 ref 쓰기 금지)
  useEffect(() => {
    reloadRef.current = reload;
  }, [reload]);

  useEffect(() => {
    if (plan !== "pro" || !enabled) return;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (document.visibilityState === "hidden") {
        // 안 보이는 탭을 긁어 봐야 노션 rate limit 만 쓴다. 돌아올 때 받는다
        missed.current = true;
      } else {
        reloadRef.current();
      }
      timer = setTimeout(tick, AUTO_SYNC_MS);
    };
    timer = setTimeout(tick, AUTO_SYNC_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible" && missed.current) {
        missed.current = false;
        reloadRef.current();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [plan, enabled]);
}
