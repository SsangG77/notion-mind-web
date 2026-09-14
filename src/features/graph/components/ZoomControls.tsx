"use client";

import { useEffect, useState } from "react";
import { useSigma } from "@react-sigma/core";

const BTN =
  "flex h-8 w-8 items-center justify-center text-sm text-[#37352F] hover:bg-[#F7F6F3] dark:text-[#EDEDEC] dark:hover:bg-[#2B2A27]";

export default function ZoomControls() {
  const sigma = useSigma();
  const camera = () => sigma.getCamera();
  // 줌 수치 — 기본 배율(1:1) = 100%
  const [percent, setPercent] = useState(() => Math.round(100 / sigma.getCamera().ratio));

  useEffect(() => {
    const cam = sigma.getCamera();
    const update = () => setPercent(Math.round(100 / cam.ratio));
    cam.on("updated", update);
    update();
    return () => {
      cam.off("updated", update);
    };
  }, [sigma]);

  return (
    <div className="absolute bottom-3 right-3 z-10 flex flex-col items-end gap-2">
      <span
        data-testid="zoom_percent"
        className="rounded-md border border-[#E9E9E7] bg-white/90 px-2 py-0.5 text-[11px] tabular-nums text-[#91908C] shadow-sm backdrop-blur dark:border-[#2F2F2F] dark:bg-[#202020]/90"
      >
        {percent}%
      </span>
      <div className="flex flex-col overflow-hidden rounded-lg border border-[#E9E9E7] bg-white shadow-sm dark:border-[#2F2F2F] dark:bg-[#202020]">
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
        <button
          data-testid="zoom_reset_button"
          className={BTN}
          onClick={() => camera().animatedReset({ duration: 300 })}
          title="기본 배율 (100%)"
        >
          ⤢
        </button>
      </div>
    </div>
  );
}
