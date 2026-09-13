"use client";

import { useSigma } from "@react-sigma/core";

const BTN =
  "flex h-8 w-8 items-center justify-center text-sm text-[#37352F] hover:bg-[#F7F6F3] dark:text-[#EDEDEC] dark:hover:bg-[#2B2A27]";

export default function ZoomControls() {
  const sigma = useSigma();
  const camera = () => sigma.getCamera();
  return (
    <div className="absolute bottom-3 right-3 z-10 flex flex-col overflow-hidden rounded-lg border border-[#E9E9E7] bg-white shadow-sm dark:border-[#2F2F2F] dark:bg-[#202020]">
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
        title="전체 보기"
      >
        ⤢
      </button>
    </div>
  );
}
