"use client";

import { useEffect } from "react";
import { useSigma } from "@react-sigma/core";

/**
 * 컨테이너 크기 변화 감지 — sigma는 창 리사이즈만 듣기 때문에,
 * 탭 전환·라우트 이동으로 컨테이너가 0이 됐다가 돌아오면 스스로 다시 재지 못한다.
 * (0일 때는 allowInvalidContainer 설정으로 예외 대신 1px로 버팀)
 */
export default function ContainerResize() {
  const sigma = useSigma();
  useEffect(() => {
    const container = sigma.getContainer();
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width === 0 || height === 0) return; // 숨김 상태 — 복귀할 때 다시 호출됨
      sigma.resize();
      sigma.refresh({ skipIndexation: true });
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [sigma]);
  return null;
}
