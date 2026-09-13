// 노드 박스(입체 블록) 디자인을 따르는 UI 요소 공통 클래스
export const BLOCK =
  "rounded-[8px] border-[1.5px] border-[#2E2C27] bg-[#FDFDFC] text-[#37352F] " +
  "shadow-[3px_3px_0_#2E2C27] " +
  "dark:border-black dark:bg-[#2B2A27] dark:text-[#EDEDEC] dark:shadow-[3px_3px_0_#000]";

// 누르는 느낌 — 돌출면 쪽으로 살짝 들어감
export const BLOCK_PRESS =
  "transition-[transform,box-shadow] duration-75 active:translate-x-[2px] active:translate-y-[2px] " +
  "active:shadow-[1px_1px_0_#2E2C27] dark:active:shadow-[1px_1px_0_#000]";
