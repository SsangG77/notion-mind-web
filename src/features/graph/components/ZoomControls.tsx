"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSigma } from "@react-sigma/core";

const BTN =
  "flex h-8 w-8 items-center justify-center text-sm text-[#37352F] hover:bg-[#F7F6F3] dark:text-[#EDEDEC] dark:hover:bg-[#2B2A27]";

const TRACK_H = 96; // 슬라이더 트랙 높이(px)

export default function ZoomControls() {
  const sigma = useSigma();
  const camera = useCallback(() => sigma.getCamera(), [sigma]);
  const trackRef = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState(() => Math.round(100 / sigma.getCamera().ratio));

  // 카메라 비율 ↔ 슬라이더 위치(0=축소 끝, 1=확대 끝) — 로그 보간
  const minRatio = (sigma.getSetting("minCameraRatio") as number) || 0.05;
  const maxRatio = (sigma.getSetting("maxCameraRatio") as number) || 100;
  const toT = useCallback(
    (ratio: number) =>
      (Math.log(maxRatio) - Math.log(ratio)) / (Math.log(maxRatio) - Math.log(minRatio)),
    [minRatio, maxRatio],
  );
  const toRatio = useCallback(
    (t: number) => Math.exp(Math.log(maxRatio) - t * (Math.log(maxRatio) - Math.log(minRatio))),
    [minRatio, maxRatio],
  );

  useEffect(() => {
    const cam = sigma.getCamera();
    const update = () => setPercent(Math.round(100 / cam.ratio));
    cam.on("updated", update);
    update();
    return () => {
      cam.off("updated", update);
    };
  }, [sigma]);

  // 트랙 위 위치 → 줌 적용 (위쪽이 확대)
  const applyFromY = useCallback(
    (clientY: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const t = 1 - Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
      camera().setState({ ratio: toRatio(t) });
    },
    [camera, toRatio],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    applyFromY(e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.buttons !== 1) return;
    applyFromY(e.clientY);
  };

  const t = toT(percent > 0 ? 100 / percent : 1);
  const thumbTop = (1 - Math.min(1, Math.max(0, t))) * TRACK_H;

  return (
    <div className="absolute bottom-3 right-3 z-10 flex flex-col items-end gap-2">
      <span
        data-testid="zoom_percent"
        className="rounded-md border border-[#E9E9E7] bg-white/90 px-2 py-0.5 text-[11px] tabular-nums text-[#91908C] shadow-sm backdrop-blur dark:border-[#2F2F2F] dark:bg-[#202020]/90"
      >
        {percent}%
      </span>
      <div className="flex flex-col items-center overflow-hidden rounded-lg border border-[#E9E9E7] bg-white shadow-sm dark:border-[#2F2F2F] dark:bg-[#202020]">
        <button
          data-testid="zoom_in_button"
          className={BTN}
          onClick={() => camera().animatedZoom({ duration: 200 })}
        >
          +
        </button>
        <button
          data-testid="zoom_out_button"
          className={`${BTN} border-y border-[#E9E9E7] dark:border-[#2F2F2F]`}
          onClick={() => camera().animatedUnzoom({ duration: 200 })}
        >
          −
        </button>

        {/* 줌 슬라이더 — 위가 확대, 아래가 축소 */}
        <div
          ref={trackRef}
          data-testid="zoom_slider"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          role="slider"
          aria-label="줌"
          aria-valuenow={percent}
          className="relative my-2 w-8 cursor-pointer touch-none"
          style={{ height: TRACK_H }}
        >
          <span className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 rounded-full bg-[#E9E9E7] dark:bg-black" />
          <span
            className="absolute left-1/2 h-1 w-3 -translate-x-1/2 rounded-full bg-[#2383E2]"
            style={{ top: Math.min(TRACK_H - 4, Math.max(0, thumbTop - 2)) }}
          />
        </div>

        <button
          data-testid="zoom_reset_button"
          className={`${BTN} border-t border-[#E9E9E7] dark:border-[#2F2F2F]`}
          onClick={() => camera().animatedReset({ duration: 300 })}
          title="기본 배율 (100%)"
        >
          ⤢
        </button>
      </div>
    </div>
  );
}
