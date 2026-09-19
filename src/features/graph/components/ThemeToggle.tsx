"use client";

import { BLOCK, BLOCK_PRESS } from "@/components/blockStyle";

/** 다크 모드 스위치 — 좌하단. 캔버스 관례대로 보기 설정은 아래 모서리 */
export default function ThemeToggle({
  dark,
  onToggle,
}: {
  dark: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      data-testid="theme_toggle_button"
      title={dark ? "라이트 모드" : "다크 모드"}
      onClick={onToggle}
      className={`${BLOCK} ${BLOCK_PRESS} absolute bottom-3 left-3 z-10 flex h-9 items-center px-2.5`}
    >
      <span className="relative h-[18px] w-[34px] rounded-full bg-[#E9E9E7] dark:bg-black">
        <span
          className={`absolute top-[2px] flex h-[14px] w-[14px] items-center justify-center rounded-full bg-white text-[9px] leading-none shadow transition-[left] duration-150 ${
            dark ? "left-[18px]" : "left-[2px]"
          }`}
        >
          {dark ? "🌙" : "☀️"}
        </span>
      </span>
    </button>
  );
}
