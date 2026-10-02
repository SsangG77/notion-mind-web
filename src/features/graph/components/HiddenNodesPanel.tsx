"use client";

import { BLOCK } from "@/components/blockStyle";
import { useT } from "@/features/i18n/LangProvider";

export interface HiddenNodeRow {
  id: string;
  title: string;
  isDb: boolean;
}

const ROW = "flex items-center justify-between gap-3 border-b border-[#E9E9E7] px-4 py-2.5 dark:border-[#2F2F2F]";

/**
 * 숨긴 노드 목록 — 설정 패널과 같은 좌측 슬라이드 노드 박스. 딤 없음(그래프 계속 조작 가능).
 * open=false 가 되면 슬라이드 아웃을 재생하고, 애니메이션이 끝나면 onClosed 로 부모가 언마운트
 */
export default function HiddenNodesPanel({
  open,
  rows,
  onUnhide,
  onShowAll,
  onClose,
  onClosed,
}: {
  open: boolean;
  rows: HiddenNodeRow[];
  onUnhide: (id: string) => void;
  onShowAll: () => void;
  /** 닫기 요청(X 버튼) */
  onClose: () => void;
  /** 슬라이드 아웃 완료 — 언마운트 시점 */
  onClosed: () => void;
}) {
  const t = useT();
  const close = onClose;

  return (
    <div
      data-testid="hidden_nodes_panel"
      className={`${BLOCK} ${open ? "nm-slide-in" : "nm-slide-out"} pointer-events-auto fixed bottom-[116px] left-3 top-[60px] z-20 flex w-[332px] flex-col overflow-hidden`}
      onAnimationEnd={(e) => {
        if (e.animationName === "nm-slide-out") onClosed();
      }}
    >
      <div className={`${ROW} shrink-0 py-3`}>
        <span className="text-sm font-semibold">{t.hiddenPanelTitle(rows.length)}</span>
        <button
          data-testid="hidden_panel_close_button"
          onClick={close}
          className="flex h-6 w-6 items-center justify-center rounded hover:bg-[#F4F3EF] dark:hover:bg-[#35342F]"
          aria-label={t.close}
        >
          ✕
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto text-sm">
        {rows.length === 0 && (
          <p className="px-4 py-6 text-center text-xs text-[#91908C]">{t.hiddenPanelEmpty}</p>
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
              {t.show}
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
            {t.showAll}
          </button>
        </div>
      )}
    </div>
  );
}
