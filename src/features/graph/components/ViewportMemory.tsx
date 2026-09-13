"use client";

import { useEffect, useRef } from "react";
import { useSigma } from "@react-sigma/core";

const KEY = "nm:viewport";

/** 뷰포트 위치 localStorage 기억 — 로드 완료 후 1회 복원, 이동 시 저장 */
export default function ViewportMemory({ ready }: { ready: boolean }) {
  const sigma = useSigma();
  const restored = useRef(false);

  useEffect(() => {
    if (!ready || restored.current) return;
    restored.current = true;
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) sigma.getCamera().setState(JSON.parse(saved));
    } catch {
      // 저장값 손상 시 무시
    }
  }, [ready, sigma]);

  useEffect(() => {
    const camera = sigma.getCamera();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const save = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          localStorage.setItem(KEY, JSON.stringify(camera.getState()));
        } catch {
          // 스토리지 불가 환경 무시
        }
      }, 400);
    };
    camera.on("updated", save);
    return () => {
      camera.off("updated", save);
      if (timer) clearTimeout(timer);
    };
  }, [sigma]);

  return null;
}
