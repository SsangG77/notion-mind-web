"use client";

import { useEffect, useRef } from "react";
import { useSigma } from "@react-sigma/core";

/**
 * 그래프 전체가 화면에 들어오도록 카메라를 한 번 맞춘다.
 *
 * 좌표계가 1단위 = 1px 이고 자동 맞춤(autoRescale)을 꺼 둔 탓에, 저장된 뷰포트가 없는 첫 방문은
 * 100% 배율로 열려 노드가 화면 밖에 흩어진다. 자기 워크스페이스는 뷰포트를 기억하지만
 * 예시 화면은 매번 처음이라 들어오자마자 아무것도 안 보이게 된다.
 *
 * 물리가 정착한 뒤에 재야 의미가 있으므로 settleMs 만큼 기다렸다가 한 번만 맞춘다.
 *
 * 전체를 다 넣으면 노드가 너무 작아져(예시 워크스페이스 기준 10%) 제목이 안 보이고 사각형만 남는다.
 * minPercent 아래로는 안 내려가게 막아, 가장자리가 좀 잘리더라도 무엇을 보고 있는지 읽히게 한다.
 */
export default function FitToGraph({
  ready,
  settleMs = 1200,
  minPercent = 15,
}: {
  ready: boolean;
  settleMs?: number;
  /** 열릴 때 보장할 최소 배율(%) — 배율 = 100 / 카메라 비율 */
  minPercent?: number;
}) {
  const sigma = useSigma();
  const done = useRef(false);

  useEffect(() => {
    if (!ready || done.current) return;
    const timer = setTimeout(() => {
      const graph = sigma.getGraph();
      if (graph.order === 0) return;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      graph.forEachNode((_id, a) => {
        const x = a.x as number, y = a.y as number;
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      });
      if (!Number.isFinite(minX)) return;

      const { width, height } = sigma.getDimensions();
      // 블록이 좌표 바깥으로 삐져나오므로 여유를 둔다
      const pad = 520;
      const spanX = Math.max(maxX - minX + pad * 2, 1);
      const spanY = Math.max(maxY - minY + pad * 2, 1);
      // ratio 는 "좌표 몇 단위가 화면 1px" 이 아니라 배율의 역수 — 큰 쪽에 맞춘다
      const ratio = Math.max(spanX / width, spanY / height);

      done.current = true;
      sigma.getCamera().setState({
        x: 0.5,
        y: 0.5,
        ratio: Math.min(Math.max(ratio, 0.05), 100 / minPercent),
        angle: 0,
      });
      // 카메라 중심은 화면 좌표계라 그래프 중심으로 다시 옮긴다
      const center = sigma.graphToViewport({ x: (minX + maxX) / 2, y: (minY + maxY) / 2 });
      const cam = sigma.getCamera();
      const state = cam.getState();
      cam.setState({
        ...state,
        x: state.x + (center.x - width / 2) / width,
        y: state.y + (center.y - height / 2) / height,
      });
    }, settleMs);
    return () => clearTimeout(timer);
  }, [ready, sigma, settleMs, minPercent]);

  return null;
}
