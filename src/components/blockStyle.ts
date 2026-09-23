// 노드 박스(입체 블록) 디자인을 따르는 UI 요소 공통 클래스.
// 면 색은 서피스색 — 캔버스의 노드(페이지 #FDFDFC / DB #F4F3EF)와 한 단계 구분해
// "조작하는 도구"와 "내 데이터"가 같은 재질이어도 층이 나뉘어 보이게 한다.
// trade-off: 반투명·블러 쪽이 층 구분은 더 세지만, 하드 엣지 블록 언어와 섞이지 않아 색으로만 나눔
export const BLOCK =
  "rounded-[8px] border-[1.5px] border-[#2E2C27] bg-[#F7F6F3] text-[#37352F] " +
  "shadow-[3px_3px_0_#2E2C27] " +
  "dark:border-black dark:bg-[#202020] dark:text-[#EDEDEC] dark:shadow-[3px_3px_0_#000]";

// 누르는 느낌 — 돌출면 쪽으로 살짝 들어감
export const BLOCK_PRESS =
  "transition-[transform,box-shadow] duration-75 active:translate-x-[2px] active:translate-y-[2px] " +
  "active:shadow-[1px_1px_0_#2E2C27] dark:active:shadow-[1px_1px_0_#000]";
