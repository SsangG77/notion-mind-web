"use client";

import { useEffect } from "react";
import { useSigma } from "@react-sigma/core";
import { T } from "../tokens";

/** relation 엣지를 점선으로 그리는 2D 캔버스 레이어 — WebGL은 점선 미지원 */
export default function RelationEdgesLayer() {
  const sigma = useSigma();
  useEffect(() => {
    const container = sigma.getContainer();
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.pointerEvents = "none";
    // 블록(labels 캔버스) 아래, WebGL 엣지 위에 삽입
    const labels = sigma.getCanvases().labels as HTMLCanvasElement | undefined;
    if (labels) container.insertBefore(canvas, labels);
    else container.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const graph = sigma.getGraph();

    const draw = () => {
      const { width, height } = sigma.getDimensions();
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const scale = 1 / Math.sqrt(sigma.getCamera().ratio); // WebGL 엣지 굵기와 동일 스케일
      // 두께 하한은 sigma 의 minEdgeThickness(1.7px)와 같게 — 축소해도 소속선보다 가늘어지지 않음
      ctx.lineWidth = Math.max(1.6 * scale, 1.7);
      // 점선 간격은 화면 px 고정. 줌에 비례시키면 축소 시 간격이 1px 아래로 뭉개져 실선으로 보임
      ctx.setLineDash([6, 5]);
      const hovered = graph.getAttribute("hoveredNode") as string | null;
      // 기본은 소속선보다 진한 관계형 색, 호버한 노드에 연결된 것만 액센트 — 두 패스로 나눠 stroke
      for (const [color, match] of [
        [T.edgeRelation, false],
        [T.accent, true],
      ] as const) {
        ctx.strokeStyle = color;
        // 호버 중엔 비연결 점선을 흐리게 (포커스 dim)
        ctx.globalAlpha = hovered != null && !match ? 0.15 : 1;
        ctx.beginPath();
        graph.forEachEdge((edge, attr, _s, _t, sa, ta) => {
          if (attr.kind !== "relation") return;
          if (sa.hidden || ta.hidden) return; // 숨긴 노드의 선은 그리지 않음
          if ((hovered != null && graph.hasExtremity(edge, hovered)) !== match) return;
          const p1 = sigma.graphToViewport({ x: sa.x as number, y: sa.y as number });
          const p2 = sigma.graphToViewport({ x: ta.x as number, y: ta.y as number });
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        });
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    sigma.on("afterRender", draw);
    draw();
    return () => {
      sigma.off("afterRender", draw);
      canvas.remove();
    };
  }, [sigma]);
  return null;
}
