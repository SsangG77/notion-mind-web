"use client";

/** 좌하단 범례 — 엣지 3종 + 호버 규칙 */
export default function Legend() {
  return (
    <div className="absolute bottom-3 left-3 z-10 rounded-lg border border-[#E9E9E7] bg-white/90 px-3 py-2 text-[11px] leading-5 text-[#37352F] shadow-sm backdrop-blur dark:border-[#2F2F2F] dark:bg-[#202020]/90 dark:text-[#EDEDEC]">
      <div className="flex items-center gap-2">
        <span className="inline-block h-0 w-6 border-t-[1.5px] border-[#2E2C27] dark:border-[#8D8A83]" />
        DB 소속 페이지
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block h-0 w-6 border-t-[1.5px] border-[#C9C7C1] dark:border-[#4A4844]" />
        페이지 안 페이지·DB
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block h-0 w-6 border-t-[1.5px] border-dashed border-[#C9C7C1] dark:border-[#4A4844]" />
        관계형(relation)
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block h-0 w-6 border-t-[1.5px] border-[#2383E2]" />
        호버한 노드의 연결
      </div>
    </div>
  );
}
