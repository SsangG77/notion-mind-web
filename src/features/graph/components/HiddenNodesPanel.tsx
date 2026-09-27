"use client";

import { useState } from "react";
import { BLOCK } from "@/components/blockStyle";

export interface HiddenNodeRow {
  id: string;
  title: string;
  isDb: boolean;
}

const ROW = "flex items-center justify-between gap-3 border-b border-[#E9E9E7] px-4 py-2.5 dark:border-[#2F2F2F]";

/** 숨긴 노드 목록 — 설정 패널과 같은 좌측 슬라이드 노드 박스. 딤 없음(그래프 계속 조작 가능) */
export default function HiddenNodesPanel({
  rows,
  onUnhide,
  onShowAll,
  onClose,
}: {
  rows: HiddenNodeRow[];
  onUnhide: (id: string) => void;
  onShowAll: () => void;
  onClose: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const close = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 200);
  };

  return (
    <div
      data-testid="hidden_nodes_panel"
      className={`${BLOCK} ${closing ? "nm-slide-out" : "nm-slide-in"} pointer-events-auto fixed bottom-[116px] left-3 top-[60px] z-20 flex w-[332px] flex-col overflow-hidden`}
    >
      <div className={`${ROW} shrink-0 py-3`}>
        <span className="text-sm font-semibold">숨긴 노드 {rows.length}개</span>
        <button
          data-testid="hidden_panel_close_button"
          onClick={close}
          className="flex h-6 w-6 items-center justify-center rounded hover:bg-[#F4F3EF] dark:hover:bg-[#35342F]"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto text-sm">
        {rows.length === 0 && (
          <p className="px-4 py-6 text-center text-xs text-[#91908C]">숨긴 노드가 없습니다</p>
        )}
        {rows.map((r) => (
          <div key={r.id} className={ROW} data-testid="hidden_node_row">
            <span className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-[#91908C]">{r.isDb ? "▤" : "▫"}</span>
              <span className="truncate">{r.title}</span>
            </span>
            <button
              data-testid="hidden_node_unhide_button"
              onClick={() => onUnhide(r.id)}
              className="shrink-0 rounded-md border border-[#E9E9E7] px-2.5 py-1 text-xs hover:bg-[#F4F3EF] dark:border-[#2F2F2F] dark:hover:bg-[#35342F]"
            >
              표시
            </button>
          </div>
        ))}
      </div>
      {rows.length > 0 && (
        <div className="shrink-0 border-t border-[#E9E9E7] p-3 dark:border-[#2F2F2F]">
          <button
            data-testid="hidden_panel_show_all_button"
            onClick={onShowAll}
            className="w-full rounded-md border border-[#E9E9E7] py-1.5 text-xs hover:bg-[#F4F3EF] dark:border-[#2F2F2F] dark:hover:bg-[#35342F]"
          >
            모두 표시
          </button>
        </div>
      )}
    </div>
  );
}
